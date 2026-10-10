import { Module } from '@nestjs/common';

import { UserService } from './application/services/user.service';
import { USER_TOKENS } from './application/tokens/user.token';
import { UserController } from './presentation/controllers/user.controller';
import { UserRepository } from './infrastructure/persistence/user.repository';

@Module({
   controllers: [UserController],

   providers: [
      UserService,
      {
         provide: USER_TOKENS.UserRepository,
         useClass: UserRepository,
      },
   ],

   exports: [UserService, USER_TOKENS.UserRepository],
})
export class UserModule {}
