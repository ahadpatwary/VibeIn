import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Put,
  UsePipes,
  Delete,
  Query,
  Inject,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../application/pipes/zodValidation.pipe';
import { UserService } from '../../application/services/user.service';
import {
  type CreateUserInput, // interface always mark as type
  createUserSchema,
} from '../../application/schemas/user.schema';

@Controller()
export class UserController {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  // @Get('user:id')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  // getUser(@Param('id') id: string) {
  //   return this.userService.getUser(id);
  // }

  @Post('user')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  createUser(@Body() body: CreateUserInput) {
    return this.userService.createUser(body);
  }

  // @Put('user:id')
  // // @UseGuards(RolesGuard)
  // // @Roles('admin')
  // updateUser(
  //   @Param('id') id: string,
  //   @Body(new ZodValidationPipe(createUserDto)) body: CreateUserBody
  // ) {
  //   return this.userService.updateUser(id, body);
  // }

  // @Get('user')
  // getSearchUser(@Query('name') name: string){
  //   console.log("name", name);
  //   return this.userService.getSearchUser(name);
  // }

  // @Delete('user:id')
  // deleteUser(@Param('id') id: string) {
  //   return this.userService.deleteUser(id);
  // }
}
