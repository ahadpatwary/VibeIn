import { DB_TOKENS, MongoService } from '@app/mongo';
import { AUTH_TOKENS } from '../tokens/token';
import { AuthIdentityRepository } from './auth.repository';
import { AuthProvider } from '@app/db-schemas';
import { ProviderAuthInput } from '../types/type';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository';
import { AccountNotFoundError, EmailAlreadyRegisteredError } from '../errors/exception';
import { CreateUserType, UserResponseType } from '@app/contracts';
import { Types } from 'mongoose';
import { USER_TOKENS } from '../../../../../user/application/tokens/user.token';

@Injectable()
export class UseCaseRepository {
   constructor(
      @Inject(DB_TOKENS.MongoService)
      private readonly mongoService: MongoService,

      @Inject(AUTH_TOKENS.AuthRepository)
      private readonly authRepo: AuthIdentityRepository,

      @Inject(USER_TOKENS.UserRepository)
      private readonly userRepo: UserRepository,
   ) {}

   async registerWithCredentials(
      userData: CreateUserType,
      passwordHash: string,
   ): Promise<UserResponseType> {
      return await this.mongoService.withTransaction<UserResponseType>(async (session) => {
         /**
          * we have to check first that user account exist or not.
          * if exist then return user already exist or not then procide.
          * we have to check it using userRepo.create().
          * if the method throw key exist error then account exist.
          */
         const created = await this.userRepo.create(userData, session).catch((error: unknown) => {
            if (
               typeof error === 'object' &&
               error !== null &&
               'code' in error &&
               error.code === 11000
            ) {
               throw new EmailAlreadyRegisteredError();
            }

            throw error;
         });

         await this.authRepo.create(
            {
               userId: created._id,
               provider: AuthProvider.Credentials,
               providerId: (created._id as Types.ObjectId).toString(),
               providerEmail: created.email,
               passwordHash,
            },
            session,
         );
         return created;
      });
   }

   async registerWithProvider(input: ProviderAuthInput): Promise<UserResponseType> {
      return await this.mongoService.withTransaction<UserResponseType>(async (session) => {
         const identities = await this.authRepo.findByProvider(
            input.provider,
            input.providerId,
            session,
         );

         if (identities) {
            const user = await this.userRepo.findById(identities.userId, session);
            if (!user) throw new AccountNotFoundError();
            /** user and auth both documents are exist -> return user */
            return user;
         }

         const user = await this.userRepo.findByEmail(input.email, session);

         if (!user) {
            /** user and auth both documents are not exist -> create both -> return user */
            const created = await this.userRepo.create(input.user, session);
            await this.authRepo.create(
               {
                  userId: created._id,
                  providerId: input.providerId,
                  provider: input.provider,
                  providerEmail: input.email,
               },
               session,
            );
            return created;
         }

         /** user exist but auth not exist -> create auth -> link auth to user -> return user */
         await this.authRepo.create(
            {
               userId: user._id,
               provider:
                  input.provider === AuthProvider.Google
                     ? AuthProvider.Google
                     : AuthProvider.Github,
               providerId: input.providerId,
               providerEmail: input.email,
            },
            session,
         );
         return user;
      });
   }

   async loginWithProvider(input: ProviderAuthInput): Promise<UserResponseType> {
      return await this.mongoService.withTransaction<UserResponseType>(async (session) => {
         const identities = await this.authRepo.findByProvider(
            input.provider,
            input.providerId,
            session,
         );

         if (identities) {
            const user = await this.userRepo.findById(identities.userId, session);
            if (!user) throw new AccountNotFoundError();
            /** user and auth both documents are exist -> return user */
            return user;
         }

         const user = await this.userRepo.findByEmail(input.email, session);

         /**
          * There are two decisions that we can take.
          *   -> One is: we simply tell to user that "Account dosen't exist. Please create!"
          *   -> Another one is: create auth and user and return user.
          *
          *  **** -> We have chosed the first option.
          */

         /** user and auth both are not exist -> return 'Account dosen't exist. Please create!' */
         if (!user) throw new AccountNotFoundError();

         /** user exist but auth not exist -> create auth -> link auth to user -> return user */
         await this.authRepo.create(
            {
               userId: user._id,
               provider: input.provider,
               providerId: input.providerId,
               providerEmail: input.email,
            },
            session,
         );

         return user;
      });
   }

   async findUserByEmail(email: string): Promise<UserResponseType> {
      const user = await this.userRepo.findByEmail(email);
      if (!user) throw new AccountNotFoundError();
      return user;
   }
}
