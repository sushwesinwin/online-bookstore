import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderStatus } from '@prisma/client';

export enum OrderSortField {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    TOTAL_AMOUNT = 'totalAmount',
    ORDER_NUMBER = 'orderNumber',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class QueryOrdersDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @IsOptional()
    @Type(() => Date)
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    endDate?: Date;

    @IsOptional()
    @IsEnum(OrderSortField)
    sortBy?: OrderSortField = OrderSortField.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
