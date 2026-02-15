import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserDocument } from '../user.mongo.schema';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(@InjectModel(UserDocument.name) private userModel: Model<UserDocument>) { }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id).exec();
    if (!doc) return null;
    return new User(doc._id.toString(), doc.name, doc.email, doc.roles);
  }

  async create(user: User): Promise<User> {
    const created = await this.userModel.create(user);
    return new User(created._id.toString(), created.name, created.email, created.roles);
  }

  async update(user: User): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(user.id, user, { new: true }).exec();
    // return updated ? new User(updated._id.toString(), updated.name, updated.email) : null;
    return updated ? new User(updated._id.toString(), updated.name, updated.email) : user;

  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
