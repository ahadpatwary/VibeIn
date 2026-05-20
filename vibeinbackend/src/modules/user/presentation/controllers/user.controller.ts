import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Put, UsePipes, Delete, Query } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserBody, createUserDto } from '../../application/dto/user.dto';
import { ZodValidationPipe } from '../../application/pipes/zodValidation.pipe';
import { UserService } from '../../application/services/user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

 
  @Get('user:id')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Get('username:username')
  existUserName(@Param('username') userName: string) {
    return this.userService.existUserName(userName)
  }

  @Post('user')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createUserDto))
  createUser(@Body() body: CreateUserBody) {
    return this.userService.createUser(body);
  }

  @Put('user:id')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createUserDto)) body: CreateUserBody
  ) {
    return this.userService.updateUser(id, body);
  }

  @Get('user')
  getSearchUser(@Query('name') name: string){
    console.log("name", name);
    return this.userService.getSearchUser(name);
  }

  @Delete('user:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}