import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum BookSortField {
    TITLE = 'title',
    AUTHOR = 'author',
    PRICE = 'price',
    CREATED_AT = 'createdAt',
    INVENTORY = 'inventory',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class QueryBooksDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    author?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsEnum(BookSortField)
    sortBy?: BookSortField = BookSortField.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;

    @IsOptional()
    @Type(() => Boolean)
    inStock?: boolean;
}
