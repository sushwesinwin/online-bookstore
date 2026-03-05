import 'dotenv/config';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ORD-${year}${month}${day}-${randomStr}`;
}

async function main() {
    console.log('🌱 Seeding additional orders...');

    const user = await prisma.user.findUnique({ where: { email: 'user@bookstore.com' } });
    if (!user) {
        console.error('Test user not found. Please run seed.ts first.');
        return;
    }

    const books = await prisma.book.findMany({ take: 5 });
    if (books.length === 0) {
        console.error('No books found. Please run seed.ts first.');
        return;
    }

    const statuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED
    ];

    for (let i = 0; i < 5; i++) {
        const orderNumber = generateOrderNumber();
        const status = statuses[i % statuses.length];

        // Pick 1-2 random books
        const numItems = Math.floor(Math.random() * 2) + 1;
        const selectedBooks = books.slice(0, numItems);

        let totalAmount = 0;
        const items = selectedBooks.map(book => {
            const quantity = Math.floor(Math.random() * 2) + 1;
            totalAmount += book.price.toNumber() * quantity;
            return {
                bookId: book.id,
                quantity,
                price: book.price
            };
        });

        await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                status,
                totalAmount,
                items: {
                    create: items
                }
            }
        });

        console.log(`✅ Created order: ${orderNumber} (${status})`);
    }

    console.log('🎉 Finished seeding orders.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
