import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserRepository } from '../../application/interfaces/user.interface';
import { CreateUserInput } from '../../application/schemas/user.schema';
import { IUser, UserSchema } from '@app/db-schemas';
import { DB_TOKENS, MongooseClient } from '@app/mongo';


@Injectable()
export class MongoUserRepository implements UserRepository {
  private readonly userModel: Model<IUser>;

  constructor(
    @Inject(DB_TOKENS.MongooseClient)
    private readonly mongooseClient: MongooseClient,
  ) {
    this.userModel = this.mongooseClient
      .getConnection()
      .model<IUser>('User', UserSchema)
    ;
  }


  async createUser(userInput: CreateUserInput) {
    const created = await this.userModel.create(userInput);
    // return new User(created._id.toString(), created.name, created.email, created.roles);
    return created;
  }

}




  // async findById(id: string){
  //   const doc = await this.userModel.findById(id).exec();
  //   if (!doc) return null;
  //   // return new User(doc._id.toString(), doc.name, doc.email, doc.roles);
  //   return doc;
  // }
  
  // async update(id: string, body: CreateUserDto) {
  //   // const updated = await this.userModel.findByIdAndUpdate(user.id, user, { new: true }).exec();
  //   // return updated ? new User(updated._id.toString(), updated.name, updated.email) : null;
  //   // return updated ? new User(updated._id.toString(), updated.name, updated.email) : user;
  //   const updated = await this.userModel.findByIdAndUpdate(id, body, { returnDocument: 'after' }).lean();
  //   return updated;
  // }

  // async delete(id: string) {
  //   const deleteUser = await this.userModel.findByIdAndDelete(id).exec();
  //   return deleteUser;
  // }


  // async getSearchUser(query: string) {
  //   const page = 1;
  //   const limit = 10;
  //   console.log("query", query)

  //   const result = await this.userModel.aggregate([
  //     {
  //       $search: {
  //         index: "VibeIn",
  //         compound: {
  //           must: [
  //             {
  //               autocomplete: {
  //                 query: query,
  //                 path: "name",
  //                 fuzzy: {
  //                   maxEdits: 1
  //                 }
  //               }
  //             }
  //           ],
  //           // filter: [
  //           //   {
  //           //     equals: {
  //           //       path: "isActive",
  //           //       value: true
  //           //     }
  //           //   },
  //           //   ...(role
  //           //     ? [
  //           //         {
  //           //           equals: {
  //           //             path: "role",
  //           //             value: role
  //           //           }
  //           //         }
  //           //       ]
  //           //     : [])
  //           // ]
  //         }
  //       }
  //     },
  //     {
  //       $addFields: {
  //         score: { $meta: "searchScore" }
  //       }
  //     },
  //     { $sort: { score: -1 } },
  //     { $skip: 0 },
  //     { $limit: limit },
  //     // {
  //     //   $project: {
  //     //     password: 0,
  //     //     refreshToken: 0
  //     //   }
  //     // }
  //   ])

  //   return result;

  // }

  // // async searchUserFromFriendlist(userId: string, name: string): Promise<User> {
      
  // // }

  // // async searchUserFromMutualFriendlist(userId: string, name: string): Promise<User> {
      
  // // }

  // // async searchUserFromGlobally(userId: string, name: string): Promise<User> {
      
  // // }