import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Put, UsePipes, Delete } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserBody, createUserDto } from '../../application/dto/user.dto';
import { ZodValidationPipe } from '../../application/pipes/zodValidation.pipe';
import { UserService } from '../../application/services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createUserDto))
  createUser(@Body() body: CreateUserBody) {
    return this.userService.createUser(body);
  }

  @Put(':id')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createUserDto)) body: CreateUserBody
  ) {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}