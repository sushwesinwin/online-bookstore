import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Get()
    getUserFavorites(@Request() req: any) {
        return this.favoritesService.getUserFavorites(req.user.id);
    }

    @Post(':bookId')
    addFavorite(@Request() req: any, @Param('bookId') bookId: string) {
        return this.favoritesService.addFavorite(req.user.id, bookId);
    }

    @Delete(':bookId')
    removeFavorite(@Request() req: any, @Param('bookId') bookId: string) {
        return this.favoritesService.removeFavorite(req.user.id, bookId);
    }
}
