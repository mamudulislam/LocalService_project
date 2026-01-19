import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { Booking } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
    constructor(@InjectModel(Booking.name) private bookingModel: Model<Booking>) { }

    async create(customerId: string, dto: CreateBookingDto) {
        const booking = new this.bookingModel({
            ...dto,
            customerId,
        });
        return (await booking.save()).populate(['serviceId', 'customerId']);
    }

    async findAllByUser(userId: string, role: string) {
        if (role === 'PROVIDER') {
            // This is more complex in Mongoose without denormalization, 
            // but for now we'll filter by finding services first or using populate match.
            // Better to useAggregation if needed, but keeping it simple.
            return this.bookingModel.find()
                .populate({
                    path: 'serviceId',
                    match: { providerId: userId },
                    populate: { path: 'categoryId', model: 'Category' }
                })
                .populate('customerId')
                .exec()
                .then(bookings => bookings.filter(b => b.serviceId !== null));
        }

        return this.bookingModel.find({ customerId: userId })
            .populate({
                path: 'serviceId',
                populate: [
                    { path: 'providerId', model: 'User' },
                    { path: 'categoryId', model: 'Category' }
                ]
            })
            .populate('customerId')
            .exec();
    }

    async findOne(id: string) {
        return this.bookingModel.findById(id)
            .populate({
                path: 'serviceId',
                populate: [
                    { path: 'providerId', model: 'User' },
                    { path: 'categoryId', model: 'Category' }
                ]
            })
            .populate('customerId')
            .exec();
    }

    async updateStatus(id: string, dto: UpdateBookingStatusDto) {
        return this.bookingModel.findByIdAndUpdate(
            id,
            { status: dto.status },
            { new: true }
        ).exec();
    }
}
