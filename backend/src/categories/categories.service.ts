import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/category.dto';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
    constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) { }

    async create(dto: CreateCategoryDto) {
        const category = new this.categoryModel(dto);
        return category.save();
    }

    async findAll() {
        return this.categoryModel.find().exec();
    }

    async findOne(id: string) {
        return this.categoryModel.findById(id).exec();
    }
}
