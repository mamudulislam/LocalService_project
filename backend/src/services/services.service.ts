import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServiceDto, FindServicesDto } from './dto/service.dto';
import { Service } from './schemas/service.schema';

@Injectable()
export class ServicesService {
    constructor(@InjectModel(Service.name) private serviceModel: Model<Service>) { }

    async create(providerId: string, dto: CreateServiceDto) {
        const service = new this.serviceModel({
            ...dto,
            providerId,
        });
        return service.save();
    }

    async findAll(query: FindServicesDto) {
        const { lat, lng, radius, categoryId, providerId } = query;

        let filter: any = {};
        if (categoryId) {
            filter.categoryId = categoryId;
        }

        if (providerId) {
            filter.providerId = providerId;
        }

        if (lat !== undefined && lng !== undefined && radius !== undefined) {
            const radiusInDeg = radius / 111.32;
            filter.locationLat = { $gte: lat - radiusInDeg, $lte: lat + radiusInDeg };
            filter.locationLng = { $gte: lng - radiusInDeg, $lte: lng + radiusInDeg };
        }

        return this.serviceModel.find(filter)
            .populate('providerId', 'id name avatar locationLat locationLng bio')
            .populate('categoryId')
            .exec();
    }

    async findOne(id: string) {
        return this.serviceModel.findById(id)
            .populate('providerId')
            .populate('categoryId')
            .exec();
    }
}
