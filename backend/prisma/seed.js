const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = [
        { name: 'Electrician', icon: '⚡', description: 'Electrical repairs and installations' },
        { name: 'Plumber', icon: '🚰', description: 'Plumbing services and pipe fixing' },
        { name: 'Tutor', icon: '📚', description: 'Academic and skills tutoring' },
        { name: 'Photographer', icon: '📸', description: 'Professional photography services' },
        { name: 'Cleaner', icon: '🧹', description: 'House and office cleaning' },
        { name: 'Painter', icon: '🎨', description: 'Interior and exterior painting' },
    ];

    for (const category of categories) {
        const existing = await prisma.category.findUnique({
            where: { name: category.name },
        });

        if (!existing) {
            await prisma.category.create({
                data: category,
            });
        }
    }

    console.log('Seed completed: Default categories created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
