export interface AuthorProfile {
  name: string;
  booksLabel: string;
  genre: string;
  image: string;
  summary: string;
  biography: string;
  color: string;
  nationality: string;
  lifeSpan: string;
  famousWorks: string[];
  genres: string[];
  awards: string[];
}

export const AUTHOR_PROFILES: AuthorProfile[] = [
  {
    name: 'George Orwell',
    booksLabel: '20+ Books',
    genre: 'Political Fiction',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/440px-George_Orwell_press_photo.jpg',
    summary: 'Author of 1984 and Animal Farm.',
    biography:
      'Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist, and critic. His work is defined by lucid prose, social criticism, opposition to totalitarianism, and support of democratic socialism.',
    color: 'from-[#0B7C6B] to-[#17BD8D]',
    nationality: 'British',
    lifeSpan: '1903-1950',
    famousWorks: ['1984', 'Animal Farm', 'Homage to Catalonia'],
    genres: ['Political Fiction', 'Dystopian', 'Social Criticism'],
    awards: ['Prometheus Hall of Fame Award'],
  },
  {
    name: 'Jane Austen',
    booksLabel: '6 Major Novels',
    genre: 'Romance',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/CassandraAusten-JaneAusten%28c.1810%29_hires.jpg/440px-CassandraAusten-JaneAusten%28c.1810%29_hires.jpg',
    summary: 'Author of Pride and Prejudice.',
    biography:
      'Jane Austen was an English novelist known for six major novels that examine the British landed gentry at the end of the 18th century. Her writing blends romance, sharp social observation, and wit.',
    color: 'from-[#FF6320] to-[#FFA118]',
    nationality: 'British',
    lifeSpan: '1775-1817',
    famousWorks: [
      'Pride and Prejudice',
      'Sense and Sensibility',
      'Emma',
      'Persuasion',
    ],
    genres: ['Romance', 'Social Commentary', 'Satire'],
    awards: ['Hall of Fame for Great Women Writers'],
  },
  {
    name: 'Ernest Hemingway',
    booksLabel: '20+ Books',
    genre: 'Classic Literature',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/ErnestHemingway.jpg/440px-ErnestHemingway.jpg',
    summary: 'Nobel Prize winning author.',
    biography:
      'Ernest Miller Hemingway was an American novelist, short-story writer, and journalist. His economical, understated prose and “iceberg theory” style influenced generations of writers.',
    color: 'from-[#219FFF] to-[#17BD8D]',
    nationality: 'American',
    lifeSpan: '1899-1961',
    famousWorks: [
      'The Old Man and the Sea',
      'A Farewell to Arms',
      'For Whom the Bell Tolls',
    ],
    genres: ['Fiction', 'Non-fiction', 'Short Stories'],
    awards: ['Nobel Prize in Literature', 'Pulitzer Prize'],
  },
  {
    name: 'Agatha Christie',
    booksLabel: '80+ Books',
    genre: 'Mystery',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Agatha_Christie_%281925%29.jpg/440px-Agatha_Christie_%281925%29.jpg',
    summary: 'Queen of mystery novels.',
    biography:
      'Dame Agatha Christie was an English writer famous for detective novels and short stories centered on Hercule Poirot and Miss Marple. She remains one of the best-selling fiction writers in history.',
    color: 'from-[#FF4E3E] to-[#FF6320]',
    nationality: 'British',
    lifeSpan: '1890-1976',
    famousWorks: [
      'Murder on the Orient Express',
      'And Then There Were None',
      'The Murder of Roger Ackroyd',
    ],
    genres: ['Mystery', 'Crime Fiction', 'Detective Fiction', 'Thriller'],
    awards: ['Grand Master Award', 'Mystery Writers of America'],
  },
  {
    name: 'F. Scott Fitzgerald',
    booksLabel: '5 Novels',
    genre: 'Classic Fiction',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/F_Scott_Fitzgerald_1921.jpg/440px-F_Scott_Fitzgerald_1921.jpg',
    summary: 'Author of The Great Gatsby.',
    biography:
      'F. Scott Fitzgerald was an American novelist and short-story writer whose work captured the glamour and fragility of the Jazz Age. He is best known for elegant prose and sharp portraits of ambition and class.',
    color: 'from-[#0B7C6B] to-[#219FFF]',
    nationality: 'American',
    lifeSpan: '1896-1940',
    famousWorks: [
      'The Great Gatsby',
      'Tender Is the Night',
      'This Side of Paradise',
    ],
    genres: ['Classic Fiction', 'Modernism', 'Social Satire'],
    awards: ['National Book Legacy Recognition'],
  },
  {
    name: 'Virginia Woolf',
    booksLabel: '9 Novels',
    genre: 'Modernist Literature',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg/440px-George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg',
    summary: 'Pioneer of modernist literature.',
    biography:
      'Virginia Woolf was an English writer whose experiments with stream of consciousness helped define literary modernism. Her novels and essays transformed the way interior life is represented in fiction.',
    color: 'from-[#17BD8D] to-[#FFA118]',
    nationality: 'British',
    lifeSpan: '1882-1941',
    famousWorks: ['Mrs Dalloway', 'To the Lighthouse', 'Orlando'],
    genres: ['Modernist Literature', 'Essay', 'Psychological Fiction'],
    awards: ['Modern Library Canon Recognition'],
  },
  {
    name: 'Mark Twain',
    booksLabel: '28 Books',
    genre: 'Satire & Humor',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mark_Twain_by_AF_Bradley.jpg/440px-Mark_Twain_by_AF_Bradley.jpg',
    summary: 'Father of American literature.',
    biography:
      'Mark Twain, the pen name of Samuel Langhorne Clemens, was an American writer and humorist. His fiction fused satire, regional speech, and social criticism into enduring classics.',
    color: 'from-[#FFA118] to-[#FF6320]',
    nationality: 'American',
    lifeSpan: '1835-1910',
    famousWorks: [
      'The Adventures of Tom Sawyer',
      'Adventures of Huckleberry Finn',
      'The Prince and the Pauper',
    ],
    genres: ['Satire', 'Humor', 'Adventure'],
    awards: ['American Literary Legacy Recognition'],
  },
  {
    name: 'Leo Tolstoy',
    booksLabel: '12 Novels',
    genre: 'Realist Fiction',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/440px-L.N.Tolstoy_Prokudin-Gorsky.jpg',
    summary: 'Master of realistic fiction.',
    biography:
      'Leo Tolstoy was a Russian writer regarded as one of the greatest novelists of all time. His works combine moral inquiry, sweeping social scope, and unmatched psychological depth.',
    color: 'from-[#219FFF] to-[#0B7C6B]',
    nationality: 'Russian',
    lifeSpan: '1828-1910',
    famousWorks: ['War and Peace', 'Anna Karenina', 'The Death of Ivan Ilyich'],
    genres: ['Realist Fiction', 'Philosophical Fiction', 'Historical Fiction'],
    awards: ['Nobel Prize Nominee Legacy'],
  },
  {
    name: 'Charles Dickens',
    booksLabel: '15 Novels',
    genre: 'Victorian Literature',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dickens_Gurney_head.jpg/440px-Dickens_Gurney_head.jpg',
    summary: 'Greatest novelist of the Victorian era.',
    biography:
      'Charles Dickens was an English novelist and social critic whose memorable characters and serialized storytelling shaped Victorian literature. His novels often exposed inequality and institutional cruelty.',
    color: 'from-[#FF4E3E] to-[#FFA118]',
    nationality: 'British',
    lifeSpan: '1812-1870',
    famousWorks: ['Great Expectations', 'A Tale of Two Cities', 'Oliver Twist'],
    genres: ['Victorian Literature', 'Social Criticism', 'Bildungsroman'],
    awards: ['Victorian Canon Recognition'],
  },
  {
    name: 'J.K. Rowling',
    booksLabel: '14 Books',
    genre: 'Fantasy',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/J._K._Rowling_2010.jpg/440px-J._K._Rowling_2010.jpg',
    summary: 'Creator of the Harry Potter series.',
    biography:
      'J.K. Rowling is a British author and philanthropist best known for the Harry Potter series. Her work built one of the most influential literary franchises of the modern era.',
    color: 'from-[#0B7C6B] to-[#FF6320]',
    nationality: 'British',
    lifeSpan: '1965-present',
    famousWorks: [
      'Harry Potter Series',
      'The Casual Vacancy',
      'Cormoran Strike Series',
    ],
    genres: ['Fantasy', 'Young Adult', 'Drama', 'Crime Fiction'],
    awards: ['Hugo Award', 'British Book Awards', 'Locus Award'],
  },
  {
    name: 'Stephen King',
    booksLabel: '60+ Books',
    genre: 'Horror & Suspense',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Stephen_King%2C_Comicon.jpg/440px-Stephen_King%2C_Comicon.jpg',
    summary: 'Master of horror fiction.',
    biography:
      'Stephen King is an American author of horror, supernatural fiction, suspense, crime, science fiction, and fantasy. His books have sold hundreds of millions of copies and shaped popular fiction for decades.',
    color: 'from-[#FF4E3E] to-[#219FFF]',
    nationality: 'American',
    lifeSpan: '1947-present',
    famousWorks: ['The Shining', 'It', 'The Stand'],
    genres: ['Horror', 'Supernatural Fiction', 'Suspense', 'Fantasy'],
    awards: [
      'Bram Stoker Award',
      'World Fantasy Award',
      'British Fantasy Society Award',
    ],
  },
  {
    name: 'Gabriel Garcia Marquez',
    booksLabel: '18 Books',
    genre: 'Magical Realism',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Gabriel_Garcia_Marquez.jpg/440px-Gabriel_Garcia_Marquez.jpg',
    summary: 'Nobel Prize winning author.',
    biography:
      'Gabriel Garcia Marquez was a Colombian novelist, journalist, and short-story writer whose work helped define magical realism. His fiction blended history, politics, and myth with lyrical force.',
    color: 'from-[#17BD8D] to-[#219FFF]',
    nationality: 'Colombian',
    lifeSpan: '1927-2014',
    famousWorks: [
      'One Hundred Years of Solitude',
      'Love in the Time of Cholera',
      'Chronicle of a Death Foretold',
    ],
    genres: ['Magical Realism', 'Literary Fiction', 'Journalism'],
    awards: ['Nobel Prize in Literature'],
  },
];

export const FEATURED_AUTHOR_NAMES = [
  'George Orwell',
  'Jane Austen',
  'Ernest Hemingway',
  'Agatha Christie',
] as const;

export const FEATURED_AUTHOR_PROFILES = AUTHOR_PROFILES.filter(author =>
  FEATURED_AUTHOR_NAMES.includes(
    author.name as (typeof FEATURED_AUTHOR_NAMES)[number]
  )
);

export const AUTHOR_PROFILE_MAP = Object.fromEntries(
  AUTHOR_PROFILES.map(author => [author.name, author])
) as Record<string, AuthorProfile>;

export function getAuthorHref(name: string): string {
  return `/authors/${encodeURIComponent(name)}`;
}

export function getAuthorByName(name: string): AuthorProfile | undefined {
  return AUTHOR_PROFILE_MAP[name];
}
