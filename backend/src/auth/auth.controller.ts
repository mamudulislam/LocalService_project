import { Controller, Post, Body, ValidationPipe, UseGuards, Patch, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body(new ValidationPipe()) dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body(new ValidationPipe()) dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('forgot-password')
    forgotPassword(@Body(new ValidationPipe()) dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    resetPassword(@Body(new ValidationPipe()) dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Post('reset-password-direct')
    resetPasswordDirect(@Body() body: { email: string; newPassword: string }) {
        return this.authService.resetPasswordDirect(body.email, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(@Request() req, @Body(new ValidationPipe()) dto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.sub, dto);
    }
}
