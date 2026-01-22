import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, FindServicesDto } from './dto/service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('services')
export class ServicesController {
    constructor(private servicesService: ServicesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PROVIDER)
    @Post()
    create(@Request() req: any, @Body(new ValidationPipe()) dto: CreateServiceDto) {
        return this.servicesService.create(req.user.userId, dto);
    }

    @Get()
    findAll(@Query() query: FindServicesDto) {
        return this.servicesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.servicesService.findOne(id);
    }
}
