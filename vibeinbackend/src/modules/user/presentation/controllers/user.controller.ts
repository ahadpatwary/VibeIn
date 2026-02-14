import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from '../../application/user.service';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserDto } from '../../application/dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
}
