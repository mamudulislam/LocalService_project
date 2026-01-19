import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Chat', required: true })
    chatId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    senderId: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: false })
    read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
