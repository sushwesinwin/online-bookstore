import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(req.user.id, createBlogDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Request() req) {
    return this.blogsService.findAll(req.user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.blogsService.findOne(id, req.user?.id);
  }
}
