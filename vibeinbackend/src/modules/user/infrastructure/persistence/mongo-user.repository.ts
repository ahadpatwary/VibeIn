import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/modules/user/application/dto/user.dto';
import { UserPersistenceRepository } from 'src/modules/user/domain/repositories/user.persistence.repository.interface';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class MongoUserRepository implements UserPersistenceRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findById(id: string){
    const doc = await this.userModel.findById(id).exec();
    if (!doc) return null;
    // return new User(doc._id.toString(), doc.name, doc.email, doc.roles);
    return doc;
  }

  async create(user: CreateUserDto) {
    const created = await this.userModel.create(user);
    // return new User(created._id.toString(), created.name, created.email, created.roles);
    return created;
  }

  async update(id: string, body: CreateUserDto) {
    // const updated = await this.userModel.findByIdAndUpdate(user.id, user, { new: true }).exec();
    // return updated ? new User(updated._id.toString(), updated.name, updated.email) : null;
    // return updated ? new User(updated._id.toString(), updated.name, updated.email) : user;
    const updated = await this.userModel.findByIdAndUpdate(id, body, { returnDocument: 'after' }).lean();
    return updated;
  }

  async delete(id: string) {
    const deleteUser = await this.userModel.findByIdAndDelete(id).exec();
    return deleteUser;
  }


  async getSearchUser(query: string) {
    const page = 1;
    const limit = 10;

    const globalSearch = await this.userModel.aggregate([
      {
          $search: {
              index: "name_search",
              autocomplete: {
                  query: query,
                  path: "name",
                  fuzzy: {
                      maxEdits: 2,
                      // prefixLength: 0,
                      // maxExpanstions: 50
                  }
              }
          }
      },
      // { $match: {_id: { $ne: userId } } },
      { $project: { _id: 1, name: 1, picture: 1, friends: 1} },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ])

  }

  // async searchUserFromFriendlist(userId: string, name: string): Promise<User> {
      
  // }

  // async searchUserFromMutualFriendlist(userId: string, name: string): Promise<User> {
      
  // }

  // async searchUserFromGlobally(userId: string, name: string): Promise<User> {
      
  // }

}