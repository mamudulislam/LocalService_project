import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    async getMyChats(@Request() req) {
        return this.chatService.getUserChats(req.user.userId);
    }

    @Get('initiate/:participantId')
    async initiateChat(@Request() req, @Param('participantId') participantId: string) {
        return this.chatService.initiateChat(req.user.userId, participantId);
    }

    @Get(':chatId/messages')
    async getMessages(@Param('chatId') chatId: string) {
        return this.chatService.getMessages(chatId);
    }

    @Post(':chatId/messages')
    async sendMessage(
        @Request() req,
        @Param('chatId') chatId: string,
        @Body('content') content: string,
    ) {
        return this.chatService.sendMessage(chatId, req.user.userId, content);
    }
}
