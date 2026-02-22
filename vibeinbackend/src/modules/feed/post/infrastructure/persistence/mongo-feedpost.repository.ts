import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FeedPostPersistenceRepository } from '../../domain/repositories/feedPost.persistence.repository.interface';
import { CreateFeedPost } from '../../application/dto/feedPost.dto';
import { FeedPost, FeedPostDocument } from './schemas/feedPost.schema';
import { Model } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';


@Injectable()
export class MongoFeedPostRepository implements FeedPostPersistenceRepository {
  constructor(
    @InjectModel(FeedPost.name) private feedPostModel: Model<FeedPostDocument>,
    @InjectModel(Media.name) private media: Model<MediaDocument>
) { }

//   async findById(id: string){
//     const doc = await this.userModel.findById(id).exec();
//     if (!doc) return null;
    // return new User(doc._id.toString(), doc.name, doc.email, doc.roles);
//     return doc;
//   }

  async createFeedPost(body: CreateFeedPost) {

    const content = body.media[0] as { url: string, public_id: string};

    const mediaObj = {
      type: 'image',
      content: { 
        url: content.url,
        public_id: content.public_id,
      }
    }

    const mediaCreated = await this.media.create(mediaObj);
    const bodyObj = {
      ...body,
      media: [mediaCreated._id],
    }
    const postCreated = await this.feedPostModel.create(bodyObj)
    // return new User(created._id.toString(), created.name, created.email, created.roles);
    return postCreated;
  }

  async getFeedPosts() {
    const posts = await this.feedPostModel
      .find()
      .populate({
        path: 'authorId',
        select: 'name profilePicture',
      })
      .populate({
        path: 'media',
        model: this.media.modelName,
        select: 'type content thumbnail',
      })
      .lean()
      .exec();

    return posts;
  }

//   async update(id: string, body: CreateUserDto) {
    // const updated = await this.userModel.findByIdAndUpdate(user.id, user, { new: true }).exec();
    // return updated ? new User(updated._id.toString(), updated.name, updated.email) : null;
    // return updated ? new User(updated._id.toString(), updated.name, updated.email) : user;
//     const updated = await this.userModel.findByIdAndUpdate(id, body, { returnDocument: 'after' }).lean();
//     return updated;
//   }

//   async delete(id: string) {
//     const deleteUser = await this.userModel.findByIdAndDelete(id).exec();
//     return deleteUser;
//   }

  // async searchUserFromFriendlist(userId: string, name: string): Promise<User> {
      
  // }

  // async searchUserFromMutualFriendlist(userId: string, name: string): Promise<User> {
      
  // }

  // async searchUserFromGlobally(userId: string, name: string): Promise<User> {
      
  // }

}