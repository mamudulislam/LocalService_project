const mongoose = require('mongoose');

const DATABASE_URL = 'mongodb+srv://mamuduli153_db_user:MTQPSJCIRAhu7EyQ@cluster0.21sdm6d.mongodb.net/';

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: String,
    description: String,
});

const Category = mongoose.model('Category', CategorySchema);

const categories = [
    { name: 'Plumbing', icon: '🚰', description: 'Fix leaks, pipes, and drains' },
    { name: 'Electrical', icon: '⚡', description: 'Wiring, outlets, and repairs' },
    { name: 'Cleaning', icon: '🧹', description: 'Houses, offices, and windows' },
    { name: 'Gardening', icon: '🌳', description: 'Lawn care and landscaping' },
    { name: 'AC Repair', icon: '❄️', description: 'Cooling and heating maintenance' },
    { name: 'Carpentry', icon: '🔨', description: 'Woodwork and furniture repair' },
    { name: 'Painting', icon: '🎨', description: 'Interior and exterior painting' },
    { name: 'Moving', icon: '📦', description: 'Relocation and transport' },
];

async function seed() {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log('Connected to MongoDB');

        for (const cat of categories) {
            try {
                await Category.updateOne(
                    { name: cat.name },
                    { $set: cat },
                    { upsert: true }
                );
                console.log(`Seeded category: ${cat.name}`);
            } catch (err) {
                console.error(`Error seeding ${cat.name}:`, err.message);
            }
        }

        console.log('Seeding completed successfully');
    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
