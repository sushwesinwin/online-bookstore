import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bookstore.com' },
    update: {},
    create: {
      email: 'admin@bookstore.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create regular test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@bookstore.com' },
    update: {},
    create: {
      email: 'user@bookstore.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Sample books data
  const booksData = [
    {
      isbn: '978-0-7432-7356-5',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
      price: 12.99,
      inventory: 50,
      category: 'Fiction',
      imageUrl: 'https://example.com/great-gatsby.jpg',
    },
    {
      isbn: '978-0-06-112008-4',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
      price: 14.99,
      inventory: 30,
      category: 'Fiction',
      imageUrl: 'https://example.com/mockingbird.jpg',
    },
    {
      isbn: '978-0-452-28423-4',
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction novel about totalitarian control and surveillance.',
      price: 13.99,
      inventory: 40,
      category: 'Science Fiction',
      imageUrl: 'https://example.com/1984.jpg',
    },
    {
      isbn: '978-0-7432-4722-4',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      description: 'A romantic novel that critiques the British landed gentry at the end of the 18th century.',
      price: 11.99,
      inventory: 25,
      category: 'Romance',
      imageUrl: 'https://example.com/pride-prejudice.jpg',
    },
    {
      isbn: '978-0-06-085052-4',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      description: 'A controversial novel about teenage rebellion and alienation in post-war America.',
      price: 13.49,
      inventory: 35,
      category: 'Fiction',
      imageUrl: 'https://example.com/catcher-rye.jpg',
    },
    {
      isbn: '978-0-7432-7357-2',
      title: 'Lord of the Flies',
      author: 'William Golding',
      description: 'A novel about a group of British boys stranded on an uninhabited island.',
      price: 12.49,
      inventory: 20,
      category: 'Fiction',
      imageUrl: 'https://example.com/lord-flies.jpg',
    },
    {
      isbn: '978-0-553-21311-7',
      title: 'Brave New World',
      author: 'Aldous Huxley',
      description: 'A dystopian novel set in a futuristic World State of genetically modified citizens.',
      price: 14.49,
      inventory: 28,
      category: 'Science Fiction',
      imageUrl: 'https://example.com/brave-new-world.jpg',
    },
    {
      isbn: '978-0-14-243724-7',
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      description: 'A fantasy novel about the adventures of Bilbo Baggins in Middle-earth.',
      price: 15.99,
      inventory: 45,
      category: 'Fantasy',
      imageUrl: 'https://example.com/hobbit.jpg',
    },
    {
      isbn: '978-0-7432-7358-9',
      title: 'Jane Eyre',
      author: 'Charlotte Brontë',
      description: 'A coming-of-age novel following the experiences of its eponymous heroine.',
      price: 13.99,
      inventory: 22,
      category: 'Romance',
      imageUrl: 'https://example.com/jane-eyre.jpg',
    },
    {
      isbn: '978-0-06-112009-1',
      title: 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe',
      author: 'C.S. Lewis',
      description: 'A fantasy novel for children about four siblings who discover a magical world.',
      price: 12.99,
      inventory: 38,
      category: 'Fantasy',
      imageUrl: 'https://example.com/narnia.jpg',
    },
    {
      isbn: '978-0-7432-7359-6',
      title: 'Wuthering Heights',
      author: 'Emily Brontë',
      description: 'A novel about the passionate and destructive love between Heathcliff and Catherine.',
      price: 13.49,
      inventory: 18,
      category: 'Romance',
      imageUrl: 'https://example.com/wuthering-heights.jpg',
    },
    {
      isbn: '978-0-553-57340-1',
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      description: 'The first novel in the epic fantasy series A Song of Ice and Fire.',
      price: 16.99,
      inventory: 55,
      category: 'Fantasy',
      imageUrl: 'https://example.com/game-thrones.jpg',
    },
    {
      isbn: '978-0-7432-7360-2',
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      description: 'A philosophical novel about a young man whose portrait ages while he remains young.',
      price: 12.99,
      inventory: 26,
      category: 'Fiction',
      imageUrl: 'https://example.com/dorian-gray.jpg',
    },
    {
      isbn: '978-0-14-144930-4',
      title: 'Dune',
      author: 'Frank Herbert',
      description: 'A science fiction novel set in the distant future amidst a feudal interstellar society.',
      price: 17.99,
      inventory: 32,
      category: 'Science Fiction',
      imageUrl: 'https://example.com/dune.jpg',
    },
    {
      isbn: '978-0-7432-7361-9',
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      description: 'A collection of twelve short stories featuring the famous detective Sherlock Holmes.',
      price: 14.99,
      inventory: 29,
      category: 'Mystery',
      imageUrl: 'https://example.com/sherlock-holmes.jpg',
    },
  ];

  // Create books
  for (const bookData of booksData) {
    const book = await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    });
    console.log(`✅ Created book: ${book.title}`);
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📚 Created ${booksData.length} books`);
  console.log('👤 Created admin user: admin@bookstore.com (password: admin123)');
  console.log('👤 Created test user: user@bookstore.com (password: user123)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });