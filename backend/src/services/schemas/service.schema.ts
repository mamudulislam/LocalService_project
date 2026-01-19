import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Service extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    providerId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
    categoryId: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    location: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    email: string;

    @Prop({ type: Number })
    locationLat?: number;

    @Prop({ type: Number })
    locationLng?: number;

    @Prop()
    description?: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
