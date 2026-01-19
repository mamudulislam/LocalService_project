import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/schemas/user.schema';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService: BookingsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.CUSTOMER)
    @Post()
    create(@Request() req: any, @Body(new ValidationPipe()) dto: CreateBookingDto) {
        return this.bookingsService.create(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req: any) {
        return this.bookingsService.findAllByUser(req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body(new ValidationPipe()) dto: UpdateBookingStatusDto) {
        return this.bookingsService.updateStatus(id, dto);
    }
}
