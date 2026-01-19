
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
    console.log('Starting category seeding...');
    for (const cat of categories) {
        try {
            const response = await fetch('http://localhost:3000/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cat),
            });
            if (response.ok) {
                console.log(`Successfully seeded: ${cat.name}`);
            } else {
                console.error(`Failed to seed: ${cat.name}`, await response.text());
            }
        } catch (error) {
            console.error(`Error seeding ${cat.name}:`, error.message);
        }
    }
    console.log('Seeding finished.');
}

seed();
