import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    ) { }

    async initiateChat(userId: string, participantId: string) {
        // Check if chat exists
        const existingChat = await this.chatModel.findOne({
            participants: { $all: [userId, participantId] },
        });

        if (existingChat) {
            return existingChat;
        }

        // Create new chat
        const newChat = new this.chatModel({
            participants: [userId, participantId],
            lastMessageAt: new Date(),
        });
        return newChat.save();
    }

    async getUserChats(userId: string) {
        return this.chatModel
            .find({ participants: userId })
            .populate('participants', 'name email role')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });
    }

    async getMessages(chatId: string) {
        return this.messageModel
            .find({ chatId })
            .populate('senderId', 'name')
            .sort({ createdAt: 1 });
    }

    async sendMessage(chatId: string, senderId: string, content: string) {
        const newMessage = new this.messageModel({
            chatId,
            senderId,
            content,
        });
        const savedMessage = await newMessage.save();

        await this.chatModel.findByIdAndUpdate(chatId, {
            lastMessage: savedMessage._id,
            lastMessageAt: new Date(),
        });

        return savedMessage;
    }
}
