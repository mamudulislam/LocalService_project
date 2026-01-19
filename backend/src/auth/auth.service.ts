import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.userModel.findOne({ email: dto.email }).exec();

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = new this.userModel({
            ...dto,
            password: hashedPassword,
        });
        await user.save();

        const payload = { sub: user._id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        };
    }

    async login(dto: LoginDto) {
        const user = await this.userModel.findOne({ email: dto.email }).exec();

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user._id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.userModel.findOne({ email: dto.email }).exec();

        if (!user) {
            // Don't reveal if user exists or not for security
            return { message: 'If the email exists, a reset link has been sent.' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiry (1 hour from now)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // TODO: Send email with reset link
        // In production, you would send an email here with the reset link
        // For now, we'll return the token (REMOVE THIS IN PRODUCTION)
        console.log('Reset token:', resetToken);
        console.log('Reset link:', `your-app://reset-password?token=${resetToken}`);

        return {
            message: 'If the email exists, a reset link has been sent.',
            // Remove this in production:
            resetToken: resetToken
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');

        const user = await this.userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        }).exec();

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Password has been reset successfully' };
    }

    // Simplified reset password for testing (without email tokens)
    async resetPasswordDirect(email: string, newPassword: string) {
        const user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return { message: 'Password has been reset successfully' };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: dto },
            { new: true }
        ).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
        };
    }
}
