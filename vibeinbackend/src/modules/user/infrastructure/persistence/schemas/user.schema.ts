import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, UserStatus } from '../../../../../shared/enums';

// ── Sub-documents ──────────────────────────────────────────────

@Schema({ _id: false })
export class SellerStats {
  @Prop({ default: 0, min: 0 })
  totalSales!: number;

  @Prop({ default: 0, min: 0 })
  totalRevenue!: number; // stored in cents to avoid float issues

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating!: number;

  @Prop({ default: 0, min: 0 })
  totalReviews!: number;

  @Prop({ default: 0, min: 0 })
  totalListings!: number;
}
export const SellerStatsSchema = SchemaFactory.createForClass(SellerStats);

@Schema({ _id: false })
export class PayoutInfo {
  @Prop({ trim: true })
  method?: string; // 'stripe' | 'bkash' | 'paypal' | 'bank'

  @Prop({ trim: true })
  accountIdentifier?: string; // masked — full value encrypted in vault

  @Prop({ default: false })
  isVerified!: boolean;
}
export const PayoutInfoSchema = SchemaFactory.createForClass(PayoutInfo);

// ── Root User Document ─────────────────────────────────────────

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  // toJSON: {
  //   virtuals: true,
  //   transform: (_doc, ret) => {
  //     delete ret.__v;
  //     return ret;
  //   },
  // },
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
    trim: true,
    maxlength: 60,
    default: '< USER >',
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
    trim: true,
    maxlength: 200,
  })
  public_id?: string;

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
  roles!: UserRole[];

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
    index: true,
  })
  status!: UserStatus;


  // @Prop({ type: SellerStatsSchema, default: () => ({}) })
  // sellerStats!: SellerStats;

  // @Prop({ type: PayoutInfoSchema })
  // payoutInfo?: PayoutInfo;

}

export const UserSchema = SchemaFactory.createForClass(User);

// ── Indexes ───────────────────────────────────────────────────
UserSchema.index({ username: 1, status: 1 });
UserSchema.index({ email: 1, status: 1 });
// UserSchema.index({ status: 1, roles: 1 });
UserSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────
UserSchema.virtual('profileUrl').get(function () {
  return `/u/${this.username}`;
});

UserSchema.pre("validate", function () {
  const hasAvatar = !!this.avatarUrl;
  const hasPublicId = !!this.public_id;

  if (hasAvatar === hasPublicId)  return;
  
  throw new Error(
    hasAvatar
      ? "public_id is required when avatarUrl is provided."
      : "avatarUrl is required when public_id is provided."
  );
});