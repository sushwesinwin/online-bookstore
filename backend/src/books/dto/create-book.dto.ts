import { IsString, IsNumber, IsOptional, Min, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({ example: '978-0-123456-78-9' })
  @IsString()
  isbn: string;

  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'F. Scott Fitzgerald' })
  @IsString()
  author: string;

  @ApiProperty({ example: 'A classic American novel', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 19.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  inventory: number;

  @ApiProperty({ example: 'Fiction' })
  @IsString()
  category: string;

  @ApiProperty({
    example: 'https://example.com/book-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
