import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CategoriesService } from './src/categories/categories.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const categoriesService = app.get(CategoriesService);

    const categories = [
        { name: 'Electrician', icon: '⚡', description: 'Electrical repairs and installations' },
        { name: 'Plumber', icon: '🚰', description: 'Plumbing services and pipe fixing' },
        { name: 'Tutor', icon: '📚', description: 'Academic and skills tutoring' },
        { name: 'Photographer', icon: '📸', description: 'Professional photography services' },
        { name: 'Cleaner', icon: '🧹', description: 'House and office cleaning' },
        { name: 'Painter', icon: '🎨', description: 'Interior and exterior painting' },
    ];

    console.log('Seeding categories...');
    for (const cat of categories) {
        const existing = await categoriesService.findAll(); // Simple check or find by name
        const exists = existing.find(c => c.name === cat.name);
        if (!exists) {
            await categoriesService.create(cat);
            console.log(`Created category: ${cat.name}`);
        }
    }

    console.log('Seed completed.');
    await app.close();
}

bootstrap();
