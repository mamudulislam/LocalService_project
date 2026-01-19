import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateBookingDto {
    @IsString()
    serviceId: string;

    @IsDateString()
    date: string;

    @IsString()
    address: string;

    @IsString()
    @IsOptional()
    clientName?: string;

    @IsString()
    @IsOptional()
    clientEmail?: string;

    @IsString()
    @IsOptional()
    clientPhone?: string;

    @IsString()
    @IsOptional()
    locationDetails?: string;

    @IsNumber()
    totalAmount: number;
}

export class UpdateBookingStatusDto {
    @IsString()
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}
