import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookFiltersDto } from './dto/book-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new book (Admin only)' })
  @ApiResponse({ status: 201, description: 'Book successfully created' })
  @ApiResponse({ status: 409, description: 'Book with ISBN already exists' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Books retrieved successfully' })
  findAll(@Query() filters: BookFiltersDto) {
    return this.booksService.findAll(filters);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all book categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories() {
    return this.booksService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({ status: 200, description: 'Book retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a book (Admin only)' })
  @ApiResponse({ status: 200, description: 'Book successfully updated' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a book (Admin only)' })
  @ApiResponse({ status: 200, description: 'Book successfully deleted' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Patch(':id/inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update book inventory (Admin only)' })
  @ApiResponse({ status: 200, description: 'Inventory successfully updated' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  updateInventory(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.booksService.updateInventory(id, quantity);
  }
}