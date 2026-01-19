import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
    @IsString()
    categoryId: string;

    @IsNumber()
    price: number;

    @IsString()
    name: string;

    @IsString()
    location: string;

    @IsString()
    phone: string;

    @IsString()
    email: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsNumber()
    locationLat?: number;

    @IsOptional()
    @IsNumber()
    locationLng?: number;
}

export class FindServicesDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lng?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    radius?: number;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    providerId?: string;
}
