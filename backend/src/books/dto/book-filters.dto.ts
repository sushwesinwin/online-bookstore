import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BookFiltersDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false, example: 'gatsby' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 'Fiction' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, example: 10.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ required: false, example: 50.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({ required: false, example: 'Fitzgerald' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false, example: 'title', enum: ['title', 'author', 'price', 'createdAt'] })
  @IsOptional()
  @IsString()
  @IsIn(['title', 'author', 'price', 'createdAt'])
  sortBy?: string;

  @ApiProperty({ required: false, example: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}