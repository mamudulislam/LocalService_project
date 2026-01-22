import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '@prisma/client';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ type: String, enum: Object.values(Role), default: Role.CUSTOMER })
    role: Role;

    @Prop()
    avatar?: string;

    @Prop()
    phone?: string;

    @Prop()
    bio?: string;

    @Prop({ type: Number })
    locationLat?: number;

    @Prop({ type: Number })
    locationLng?: number;

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
