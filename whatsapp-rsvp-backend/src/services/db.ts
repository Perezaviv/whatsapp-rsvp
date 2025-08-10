
import { PrismaClient } from '@prisma/client';
import { RsvpStatus } from '../types';

export const prisma = new PrismaClient();

// Seed data if the database is empty
export const seedDatabase = async () => {
    try {
        const guestCount = await prisma.guest.count();
        if (guestCount === 0) {
            console.log('Database is empty. Seeding initial guests...');
            const names = ['Israel Israeli', 'Moshe Cohen', 'Avi Levi', 'Dana Sharon', 'Yael Katz', 'Tomer Hadad', 'Noa Biton', 'Guy Avraham'];
            
            const guestsToCreate = Array.from({ length: 20 }, (_, i) => {
                const randomName = names[Math.floor(Math.random() * names.length)];
                // NOTE: For a real app, use real phone numbers you can test with.
                // These random numbers won't work.
                const phone = `9725${Math.floor(10000000 + Math.random() * 90000000)}`.slice(0, 12);

                return {
                    name: `${randomName} ${i + 1}`,
                    phone: phone,
                    status: RsvpStatus.PENDING,
                };
            });

            await prisma.guest.createMany({
                data: guestsToCreate,
            });
            console.log('Seeding complete. 20 guests created.');
        } else {
            console.log('Database already contains data. Skipping seed.');
        }
    } catch (error) {
        console.error("Could not seed database. This might happen if the database is not reachable or if there are schema issues. Please check your database connection and run 'npx prisma db push'.", error);
    }
};
