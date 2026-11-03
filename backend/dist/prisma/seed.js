"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const regionsData = [
    { name: 'Addis Ababa', cities: ['Addis Ababa'] },
    { name: 'Dire Dawa', cities: ['Dire Dawa'] },
    { name: 'Oromia', cities: ['Adama', 'Jimma', 'Bishoftu', 'Nekemte', 'Shashamane'] },
    { name: 'Amhara', cities: ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos'] },
    { name: 'Tigray', cities: ['Mekelle', 'Adigrat', 'Axum'] },
    { name: 'Somali', cities: ['Jijiga'] },
    { name: 'Afar', cities: ['Semera'] },
    { name: 'Benishangul-Gumuz', cities: ['Asosa'] },
    { name: 'Gambela', cities: ['Gambela'] },
    { name: 'Harari', cities: ['Harar'] },
    { name: 'Sidama', cities: ['Hawassa'] },
    { name: 'South Ethiopia', cities: ['Wolaita Sodo', 'Arba Minch'] },
    { name: 'Central Ethiopia', cities: ['Hosaena', 'Worabe'] },
    { name: 'South West Ethiopia Peoples', cities: ['Bonga'] },
];
const categoriesData = [
    'Electrician',
    'Plumber',
    'Tutor',
    'Driver / Transport',
    'Printing Service',
    'Shop / Retail',
    'Restaurant',
    'Phone Repair',
    'Beauty & Salon',
    'Auto Repair',
    'Construction',
    'Cleaning Service',
];
async function main() {
    for (const r of regionsData) {
        const region = await prisma.region.upsert({
            where: { name: r.name },
            update: {},
            create: { name: r.name },
        });
        for (const cityName of r.cities) {
            await prisma.city.upsert({
                where: { regionId_name: { regionId: region.id, name: cityName } },
                update: {},
                create: { name: cityName, regionId: region.id },
            });
        }
    }
    for (const categoryName of categoriesData) {
        await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName },
        });
    }
    console.log('Seed complete:', regionsData.length, 'regions,', categoriesData.length, 'categories.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map