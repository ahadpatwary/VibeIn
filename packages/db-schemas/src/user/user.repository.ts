import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { BaseRepository } from '@orderbari/mongo-db-core';
import { MODEL_TOKENS } from '../tokens/model.tokens';
import { UserDocument, UserRole } from './user.types';

@injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@inject(MODEL_TOKENS.UserModel) model: Model<UserDocument>) {
    super(model);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findActiveByRole(role: UserRole): Promise<UserDocument[]> {
    return this.find({ role, isActive: true });
  }

  async softDelete(id: string): Promise<UserDocument | null> {
    return this.updateById(id, { deletedAt: new Date(), isActive: false } as never);
  }
}
