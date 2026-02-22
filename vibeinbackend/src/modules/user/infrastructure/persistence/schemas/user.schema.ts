import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

// export type UserDocument = User & Document;
export type UserDocument = HydratedDocument<User>;

@Schema({_id: false})
class ProfilePicture {
  @Prop({
    type: String,
    default: null,
  })
  url?: string | null;

  @Prop({
    type: String,
    default: null
  })
  public_id?: string | null;

}

const ProfilePictureSchema = SchemaFactory.createForClass(ProfilePicture);


@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    trim: true,
    default: '<User>',
  })
  name: string;

  @Prop({
    type: String,
    trim: true,
  })
  phoneNumber?: string;

  @Prop({
    type: ProfilePictureSchema,
    default: {}
  })
  profilePicture?: ProfilePicture;

  @Prop({
    type: Date,
  })
  dateOfBirth?: Date;

  @Prop({
    type: Number,
    default: 0,
  })
  friendsCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.pre<UserDocument>('validate', async function () {
  const profile = this.profilePicture;

  if (!profile) return;

  const hasUrl = !!profile.url;
  const hasPublicId = !!profile.public_id;

  if ((hasUrl && !hasPublicId) || (!hasUrl && hasPublicId)) {
    throw new Error(
      'profilePicture.url and profilePicture.public_id must be provided together',
    );
  }
});
