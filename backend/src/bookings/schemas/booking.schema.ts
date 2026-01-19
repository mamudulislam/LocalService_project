import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Booking extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    customerId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
    serviceId: string;

    @Prop({ type: String, enum: BookingStatus, default: 'PENDING' })
    status: BookingStatus;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    address: string;

    @Prop()
    clientName?: string;

    @Prop()
    clientEmail?: string;

    @Prop()
    clientPhone?: string;

    @Prop()
    locationDetails?: string;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ default: 'PENDING' })
    paymentStatus: string;

    @Prop()
    stripeIntentId?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
