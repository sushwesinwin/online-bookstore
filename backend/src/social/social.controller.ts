import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialService } from './social.service';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('relationships')
  getRelationshipStatuses(
    @Request() req: any,
    @Query('userIds') userIds: string = ''
  ) {
    return this.socialService.getRelationshipStatuses(
      req.user.id,
      userIds
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
    );
  }

  @Post('follow/:userId')
  followWriter(@Request() req: any, @Param('userId') userId: string) {
    return this.socialService.followUser(req.user.id, userId);
  }

  @Delete('follow/:userId')
  unfollowWriter(@Request() req: any, @Param('userId') userId: string) {
    return this.socialService.unfollowUser(req.user.id, userId);
  }

  @Post('friend/:userId')
  addFriend(@Request() req: any, @Param('userId') userId: string) {
    return this.socialService.addFriend(req.user.id, userId);
  }

  @Delete('friend/:userId')
  removeFriend(@Request() req: any, @Param('userId') userId: string) {
    return this.socialService.removeFriend(req.user.id, userId);
  }
}
