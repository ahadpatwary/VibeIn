import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class PasswordHasher {
   private dummyHash?: Promise<string>;

   async hash(plain: string): Promise<string> {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(plain, salt);
      return hash;
   }

   // hash na thakleo dummy verify kore timing same rakhe
   // for seacurity reason we have to compare the password with dummy password.
   async verify(hash: string | undefined, plain: string): Promise<boolean> {
      if (!hash) {
         this.dummyHash ??= this.hash('dummy-password-for-timing');
         await bcrypt.compare(await this.dummyHash, plain).catch(() => false);
         return false;
      }
      return await bcrypt.compare(hash, plain).catch(() => false);
   }
}
