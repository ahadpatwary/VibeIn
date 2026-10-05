import { DB_TOKENS, MongoService } from '@app/mongo';
import { AUTH_TOKENS } from '../../application/tokens/token';
import { AuthIdentityRepository } from './auth.repository';
import { AuthProvider, IUser } from '@app/db-schemas';
import { ProviderAuthInput } from '../../application/types/type';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../user/infrastructure/persistence/user.repository';
import { NewUser, UserRecord } from '../../../user/application/types/user.type';
import {
   AccountNotFoundError,
   EmailAlreadyRegisteredError,
} from '../../application/errors/exception';

@Injectable()
export class UseCaseRepository {
   constructor(
      @Inject(DB_TOKENS.MongoService)
      private readonly mongoService: MongoService,

      @Inject(AUTH_TOKENS.AuthRepository)
      private readonly authRepo: AuthIdentityRepository,

      @Inject(AUTH_TOKENS.UserRepository)
      private readonly userRepo: UserRepository,
   ) {}

   async registerWithCredentials(userData: NewUser, passwordHash: string): Promise<IUser> {
      return await this.mongoService.withTransaction<IUser>(async (session) => {
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
               providerId: created._id.toString(),
               providerEmail: created.email,
               passwordHash,
            },
            session,
         );
         return created;
      });
   }

   async registerWithProvider(input: ProviderAuthInput): Promise<UserRecord> {
      return await this.mongoService.withTransaction<UserRecord>(async (session) => {
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
                  provider: AuthProvider.Credentials,
                  providerId: created._id.toString(),
                  providerEmail: created.email,
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

   async loginWithProvider(input: ProviderAuthInput): Promise<UserRecord> {
      return await this.mongoService.withTransaction<UserRecord>(async (session) => {
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

   async findUserByEmail(email: string): Promise<UserRecord> {
      const user = await this.userRepo.findByEmail(email);
      if (!user) throw new AccountNotFoundError();
      return user;
   }
}
