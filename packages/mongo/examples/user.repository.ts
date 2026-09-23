import { injectable } from 'tsyringe';
import { BaseRepository } from './repository/base.repository';
import { UserModel, UserDocument } from './user.schema';

@injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string) {
    return this.findOne({ email: email.toLowerCase() });
  }
}
