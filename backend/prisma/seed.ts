import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

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

  // Sample books data with real cover images
  const booksData = [
    {
      isbn: '978-0-7432-7356-5',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
      price: 12.99,
      inventory: 50,
      category: 'Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    },
    {
      isbn: '978-0-06-112008-4',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
      price: 14.99,
      inventory: 30,
      category: 'Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    },
    {
      isbn: '978-0-452-28423-4',
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction novel about totalitarian control and surveillance.',
      price: 13.99,
      inventory: 40,
      category: 'Science Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780452284234-L.jpg',
    },
    {
      isbn: '978-0-7432-4722-4',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      description: 'A romantic novel that critiques the British landed gentry at the end of the 18th century.',
      price: 11.99,
      inventory: 25,
      category: 'Romance',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780743477222-L.jpg',
    },
    {
      isbn: '978-0-06-085052-4',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      description: 'A controversial novel about teenage rebellion and alienation in post-war America.',
      price: 13.49,
      inventory: 35,
      category: 'Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg',
    },
    {
      isbn: '978-0-7432-7357-2',
      title: 'Lord of the Flies',
      author: 'William Golding',
      description: 'A novel about a group of British boys stranded on an uninhabited island.',
      price: 12.49,
      inventory: 20,
      category: 'Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780399501487-L.jpg',
    },
    {
      isbn: '978-0-553-21311-7',
      title: 'Brave New World',
      author: 'Aldous Huxley',
      description: 'A dystopian novel set in a futuristic World State of genetically modified citizens.',
      price: 14.49,
      inventory: 28,
      category: 'Science Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg',
    },
    {
      isbn: '978-0-14-243724-7',
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      description: 'A fantasy novel about the adventures of Bilbo Baggins in Middle-earth.',
      price: 15.99,
      inventory: 45,
      category: 'Fantasy',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
    },
    {
      isbn: '978-0-7432-7358-9',
      title: 'Jane Eyre',
      author: 'Charlotte Brontë',
      description: 'A coming-of-age novel following the experiences of its eponymous heroine.',
      price: 13.99,
      inventory: 22,
      category: 'Romance',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg',
    },
    {
      isbn: '978-0-06-112009-1',
      title: 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe',
      author: 'C.S. Lewis',
      description: 'A fantasy novel for children about four siblings who discover a magical world.',
      price: 12.99,
      inventory: 38,
      category: 'Fantasy',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780064404990-L.jpg',
    },
    {
      isbn: '978-0-7432-7359-6',
      title: 'Wuthering Heights',
      author: 'Emily Brontë',
      description: 'A novel about the passionate and destructive love between Heathcliff and Catherine.',
      price: 13.49,
      inventory: 18,
      category: 'Romance',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780141439556-L.jpg',
    },
    {
      isbn: '978-0-553-57340-1',
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      description: 'The first novel in the epic fantasy series A Song of Ice and Fire.',
      price: 16.99,
      inventory: 55,
      category: 'Fantasy',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780553573404-L.jpg',
    },
    {
      isbn: '978-0-7432-7360-2',
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      description: 'A philosophical novel about a young man whose portrait ages while he remains young.',
      price: 12.99,
      inventory: 26,
      category: 'Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg',
    },
    {
      isbn: '978-0-14-144930-4',
      title: 'Dune',
      author: 'Frank Herbert',
      description: 'A science fiction novel set in the distant future amidst a feudal interstellar society.',
      price: 17.99,
      inventory: 32,
      category: 'Science Fiction',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
    },
    {
      isbn: '978-0-7432-7361-9',
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      description: 'A collection of twelve short stories featuring the famous detective Sherlock Holmes.',
      price: 14.99,
      inventory: 29,
      category: 'Mystery',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780486474915-L.jpg',
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

  // Sample quotes data
  const quotesData = [
    {
      text: 'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
      author: 'George R.R. Martin',
      source: 'A Dance with Dragons',
      category: 'Reading',
    },
    {
      text: 'The only thing that you absolutely have to know, is the location of the library.',
      author: 'Albert Einstein',
      category: 'Knowledge',
    },
    {
      text: 'There is no friend as loyal as a book.',
      author: 'Ernest Hemingway',
      category: 'Reading',
    },
    {
      text: 'Books are a uniquely portable magic.',
      author: 'Stephen King',
      source: 'On Writing',
      category: 'Reading',
    },
    {
      text: 'I have always imagined that Paradise will be a kind of library.',
      author: 'Jorge Luis Borges',
      category: 'Reading',
    },
    {
      text: 'A room without books is like a body without a soul.',
      author: 'Marcus Tullius Cicero',
      category: 'Reading',
    },
    {
      text: 'So many books, so little time.',
      author: 'Frank Zappa',
      category: 'Reading',
    },
    {
      text: 'Reading is to the mind what exercise is to the body.',
      author: 'Joseph Addison',
      category: 'Knowledge',
    },
    {
      text: 'The more that you read, the more things you will know. The more that you learn, the more places you will go.',
      author: 'Dr. Seuss',
      source: 'I Can Read With My Eyes Shut!',
      category: 'Learning',
    },
    {
      text: 'A book is a dream that you hold in your hand.',
      author: 'Neil Gaiman',
      category: 'Reading',
    },
    {
      text: 'If you don\'t like to read, you haven\'t found the right book.',
      author: 'J.K. Rowling',
      category: 'Reading',
    },
    {
      text: 'Think before you speak. Read before you think.',
      author: 'Fran Lebowitz',
      category: 'Knowledge',
    },
    {
      text: 'The reading of all good books is like a conversation with the finest minds of past centuries.',
      author: 'René Descartes',
      category: 'Reading',
    },
    {
      text: 'Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors.',
      author: 'Charles William Eliot',
      category: 'Reading',
    },
    {
      text: 'You can never get a cup of tea large enough or a book long enough to suit me.',
      author: 'C.S. Lewis',
      category: 'Reading',
    },
  ];

  // Create quotes
  let quoteCount = 0;
  for (const quoteData of quotesData) {
    await prisma.quote.upsert({
      where: {
        id: `quote-${quoteCount}`
      },
      update: quoteData,
      create: {
        id: `quote-${quoteCount}`,
        ...quoteData,
      },
    });
    quoteCount++;
  }
  console.log(`✅ Created ${quoteCount} quotes`);

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📚 Created ${booksData.length} books`);
  console.log(`💭 Created ${quoteCount} quotes`);
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