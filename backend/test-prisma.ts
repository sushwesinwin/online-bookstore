import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log('User query successful:', user);
  } catch (e) {
    console.error('User query error:');
    console.error(e);
  }

  try {
    const book = await prisma.book.findFirst({ where: { inventory: { gt: 0 } } });
    console.log('Book query successful:', book);
  } catch (e) {
    console.error('Book query error:');
    console.error(e);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
