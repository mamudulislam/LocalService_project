import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
    participants: string[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Message' })
    lastMessage: string;

    @Prop()
    lastMessageAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
