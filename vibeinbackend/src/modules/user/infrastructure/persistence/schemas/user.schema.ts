// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, HydratedDocument } from 'mongoose';

// // export type UserDocument = User & Document;
// export type UserDocument = HydratedDocument<User>;

// @Schema({_id: false})
// class ProfilePicture {
//   @Prop({
//     type: String,
//     default: null,
//   })
//   url?: string | null;

//   @Prop({
//     type: String,
//     default: null
//   })
//   public_id?: string | null;

// }

// const ProfilePictureSchema = SchemaFactory.createForClass(ProfilePicture);


// @Schema({ timestamps: true })
// export class User {
//   @Prop({
//     type: String,
//     trim: true,
//     default: '<User>',
//   })
//   name: string;

//   @Prop({
//     type: String,
//     trim: true,
//   })
//   phoneNumber?: string;

//   @Prop({
//     type: ProfilePictureSchema,
//     default: {}
//   })
//   profilePicture?: ProfilePicture;

//   @Prop({
//     type: Date,
//   })
//   dateOfBirth?: Date;

//   @Prop({
//     type: Number,
//     default: 0,
//   })
//   friendsCount: number;
// }

// export const UserSchema = SchemaFactory.createForClass(User);


// UserSchema.pre<UserDocument>('validate', async function () {
//   const profile = this.profilePicture;

//   if (!profile) return;

//   const hasUrl = !!profile.url;
//   const hasPublicId = !!profile.public_id;

//   if ((hasUrl && !hasPublicId) || (!hasUrl && hasPublicId)) {
//     throw new Error(
//       'profilePicture.url and profilePicture.public_id must be provided together',
//     );
//   }
// });



import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, UserStatus } from '../../../../../shared/enums';

// ── Sub-documents ──────────────────────────────────────────────

@Schema({ _id: false })
export class SellerStats {
  @Prop({ default: 0, min: 0 })
  totalSales: number;

  @Prop({ default: 0, min: 0 })
  totalRevenue: number; // stored in cents to avoid float issues

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number;

  @Prop({ default: 0, min: 0 })
  totalReviews: number;

  @Prop({ default: 0, min: 0 })
  totalListings: number;
}
export const SellerStatsSchema = SchemaFactory.createForClass(SellerStats);

@Schema({ _id: false })
export class PayoutInfo {
  @Prop({ trim: true })
  method?: string; // 'stripe' | 'bkash' | 'paypal' | 'bank'

  @Prop({ trim: true })
  accountIdentifier?: string; // masked — full value encrypted in vault

  @Prop({ default: false })
  isVerified: boolean;
}
export const PayoutInfoSchema = SchemaFactory.createForClass(PayoutInfo);

// ── Root User Document ─────────────────────────────────────────

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  // ── Identity ──
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-z0-9_]+$/,
    index: true,
  })
  username!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 60,
    index: true,
  })
  fullName!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    index: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 20,
    select: false
  })
  phoneNumber!: string;

  @Prop({ trim: true, maxlength: 500 })
  bio?: string;

  @Prop({ trim: true, maxlength: 500 })
  avatarUrl?: string;

  @Prop({
    type: [{ college: String, degree: String }],
    default: [],
    validate: {
      validator: (arr: { college: string, degree: string}[]) => arr.length <= 7,
      message: 'Maximum 7 education entries allowed'
    }
  })
  education!: { college: string, degree: string }[];

  @Prop({
    type: [ String ],
    default: [],
    validate: {
      validator: (arr: string[]) => arr.length < 10,
      message: 'Maximum 10 skill entries allowed'
    }
  })
  skills!: string[];

  @Prop({ 
    type: [{ platform: String, url: String }], 
    default: [], 
    validate: {
      validator: (arr: { url: string; platform: string }[]) => arr.length <= 7,
      message: 'Maximum 7 social links allowed'
    },
  })
  socialLinks!: { url: string, platform: string }[];

  // ── Role & Status ──
  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    default: [UserRole.BUYER],
  })
  roles: UserRole[];

  // @Prop({
  //   type: String,
  //   enum: Object.values(UserStatus),
  //   default: UserStatus.ACTIVE,
  //   index: true,
  // })
  // status: UserStatus;

  // ── Email verification ──
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ select: false })
  emailVerificationToken?: string;

  @Prop({ select: false })
  emailVerificationExpires?: Date;

  // ── Password reset ──
  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;

  // ── Seller-specific ──
  @Prop({ default: false })
  isVerifiedSeller: boolean;

  @Prop({ type: SellerStatsSchema, default: () => ({}) })
  sellerStats: SellerStats;

  @Prop({ type: PayoutInfoSchema })
  payoutInfo?: PayoutInfo;

  // ── Activity ──
  @Prop()
  lastLoginAt?: Date;

  @Prop({ default: 0 })
  loginCount: number;

  // ── Soft delete ──
  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ── Indexes ───────────────────────────────────────────────────
UserSchema.index({ username: 1, isDeleted: 1 });
UserSchema.index({ email: 1, isDeleted: 1 });
UserSchema.index({ status: 1, roles: 1 });
UserSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────
UserSchema.virtual('profileUrl').get(function () {
  return `/u/${this.username}`;
});