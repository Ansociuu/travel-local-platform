import { Controller, Delete, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req) {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/posts')
  createPost(@Request() req, @Body() body: any) {
    return this.usersService.createPost(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/posts/:postId')
  updatePost(@Request() req, @Param('postId') postId: string, @Body() body: any) {
    return this.usersService.updatePost(req.user.id, postId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/posts/:postId')
  deletePost(@Request() req, @Param('postId') postId: string) {
    return this.usersService.deletePost(req.user.id, postId);
  }

  @Get(':id/profile')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
