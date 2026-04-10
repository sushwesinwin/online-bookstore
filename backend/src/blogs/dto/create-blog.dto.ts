import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const BLOG_FONT_FAMILIES = [
  'modern-sans',
  'editorial-serif',
  'literary-serif',
  'classic-mono',
] as const;

const BLOG_POST_VISIBILITIES = [
  'PUBLIC',
  'FOLLOWERS',
  'FRIENDS',
  'PRIVATE',
] as const;

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  featureImage?: string;

  @IsOptional()
  @IsString()
  @IsIn(BLOG_FONT_FAMILIES)
  fontFamily?: (typeof BLOG_FONT_FAMILIES)[number];

  @IsOptional()
  @IsString()
  @IsIn(BLOG_POST_VISIBILITIES)
  visibility?: (typeof BLOG_POST_VISIBILITIES)[number];
}
