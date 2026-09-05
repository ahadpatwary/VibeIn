import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  Currency,
  LicenseType,
  ListingStatus,
  ListingVisibility,
} from '../../../../../shared/enums';


// ── Sub-documents ──────────────────────────────────────────────

@Schema({ _id: false })
export class PricingInfo {
  /** Price stored in cents (e.g. $49.00 → 4900) to avoid float precision issues */
  @Prop({ required: true, min: 0 })
  amountCents!: number;

  @Prop({
    type: String,
    enum: Object.values(Currency),
    default: Currency.USD,
  })
  currency!: Currency;

  /** Convenience getter — do NOT store this */
  get amount(): number {
    return this.amountCents / 100;
  }

  @Prop({ default: false })
  isFree!: boolean;
}
export const PricingInfoSchema = SchemaFactory.createForClass(PricingInfo);

@Schema({ _id: false })
export class MediaAsset {
  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ trim: true })
  altText?: string;

  /** 'thumbnail' | 'screenshot' | 'video_thumb' */
  @Prop({ required: true, enum: ['thumbnail', 'screenshot', 'video_thumb'] })
  type!: string;

  @Prop({ default: 0 })
  sortOrder!: number;
}
export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);

@Schema({ _id: false })
export class RepositoryInfo {
  /** If seller connected GitHub */
  @Prop({ trim: true })
  githubRepoUrl?: string;

  @Prop({ trim: true })
  defaultBranch?: string;

  /** Last sync with GitHub */
  @Prop()
  lastSyncedAt?: Date;

  /** Internal code store path on platform */
  @Prop({ trim: true })
  internalStoragePath?: string;

  @Prop({ default: false })
  isSyncEnabled!: boolean;
}
export const RepositoryInfoSchema = SchemaFactory.createForClass(RepositoryInfo);

@Schema({ _id: false })
export class ListingStats {
  @Prop({ default: 0, min: 0 })
  viewCount!: number;

  @Prop({ default: 0, min: 0 })
  salesCount!: number;

  @Prop({ default: 0, min: 0 })
  cloneCount!: number;

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating!: number;

  @Prop({ default: 0, min: 0 })
  reviewCount!: number;

  /** Revenue earned on this listing in cents */
  @Prop({ default: 0, min: 0 })
  totalRevenueCents!: number;
}
export const ListingStatsSchema = SchemaFactory.createForClass(ListingStats);

@Schema({ _id: false })
export class SEOMeta {
  @Prop({ trim: true, maxlength: 160 })
  metaDescription?: string;

  @Prop({ type: [String], default: [] })
  keywords!: string[];
}
export const SEOMetaSchema = SchemaFactory.createForClass(SEOMeta);

// ── Root Listing Document ──────────────────────────────────────

export type ListingDocument = Listing & Document;

@Schema({
  collection: 'listings',
  timestamps: true,
  toJSON: {
    virtuals: true,
    // transform: (_doc, ret) => {
    //   delete ret.__v;
    //   return ret;
    // },
  },
})
export class Listing {
  // ── Ownership ──
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  seller!: Types.ObjectId;

  // ── Core Content ──
  @Prop({
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 120,
  })
  title!: string;

  /**
   * URL-friendly slug — unique, auto-generated from title.
   * e.g. "saas-dashboard-nextjs-stripe-kit-a1b2"
   */
  // @Prop({
  //   required: true,
  //   unique: true,
  //   trim: true,
  //   lowercase: true,
  //   index: true,
  // })
  // slug!: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 5000,
  })
  description!: string;

  // ── Pricing ──
  @Prop({ type: PricingInfoSchema, required: true })
  price!: PricingInfo;

  @Prop({
    type: String,
    enum: Object.values(Currency),
    default: Currency.USD,
  })
  currency!: Currency;

  @Prop({ default: 0, min: 0, max: 5 })
  rating!: number;

  @Prop({ default: 0, min: 0 })
  reviewCount!: number;

  @Prop({ default: 0, min: 0 })
  salesCount!: number;

  @Prop({ default: 0, min: 0 })
  viewCount!: number;

  // ── Tech Stack ──
  @Prop({
    type: [String],
    default: [],
    validate: {
      validator: (v: string[]) => v.length <= 15,
      message: 'Tech stack cannot exceed 15 tags',
    },
  })
  techStack!: string[];

  @Prop({
    type: String,
    enum: Object.values(LicenseType),
    required: true,
    default: LicenseType.MIT,
  })
  licenseType!: LicenseType;

  @Prop({ default: false })
  isPrivate!: boolean;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ type: String, trim: true, required: true })
  previewUrl!: string;

  @Prop({ type: String, trim: true, required: true })
  productUrl!: string;

  // // ── Status & Visibility ──
  // @Prop({
  //   type: String,
  //   enum: Object.values(ListingStatus),
  //   default: ListingStatus.DRAFT,
  //   index: true,
  // })
  // status!: ListingStatus;

  @Prop({
    type: String,
    enum: Object.values(ListingVisibility),
    default: ListingVisibility.PUBLIC,
    index: true,
  })
  visibility!: ListingVisibility;


  // @Prop()
  // featuredUntil?: Date;

  // ── Published timestamp ──
  @Prop()
  postedAt?: Date;

  // ── Media ──
  @Prop({ 
    type: [MediaAssetSchema], 
    default: [],
    validate:{
        validator: (v: MediaAsset[]) => v.length <= 7,
        message: 'Maximum 7 media assets allowed'
    },
  })
  media!: MediaAsset[];

  // ── Repository ──
  // @Prop({ type: RepositoryInfoSchema, default: () => ({}) })
  // repository!: RepositoryInfo;


  // ── Stats ──
  // @Prop({ type: ListingStatsSchema, default: () => ({}) })
  // stats!: ListingStats;

  // ── SEO ──
  // @Prop({ type: SEOMetaSchema, default: () => ({}) })
  // seo!: SEOMeta;

  // ── Moderation ──
  // @Prop({ trim: true, maxlength: 1000 })
  // moderationNote?: string;

  // @Prop()
  // moderatedAt?: Date;

  // @Prop({ type: Types.ObjectId, ref: 'User' })
  // moderatedBy?: Types.ObjectId;

  // // ── Soft delete ──
  // @Prop({ default: false, index: true })
  // isDeleted!: boolean;

  // @Prop()
  // deletedAt?: Date;


}

export const ListingSchema = SchemaFactory.createForClass(Listing);



ListingSchema.index({ status: 1, visibility: 1, isDeleted: 1 });
ListingSchema.index({ seller: 1, status: 1, isDeleted: 1 });
ListingSchema.index({ isFeatured: 1, publishedAt: -1 });
ListingSchema.index({ 'stats.salesCount': -1, status: 1 });
ListingSchema.index({ 'stats.averageRating': -1, status: 1 });
ListingSchema.index({ techStack: 1, status: 1 });
ListingSchema.index({ createdAt: -1, status: 1 });


// ── Text Search Index ─────────────────────────────────────────
ListingSchema.index(
  { title: 'text', description: 'text', techStack: 'text' },
  { weights: { title: 10, techStack: 5, description: 1 }, name: 'listing_text_search' },
);

// ── Virtuals ──────────────────────────────────────────────────
// ListingSchema.virtual('url').get(function () {
//   return `/p/${this.slug}`;
// });

ListingSchema.virtual('thumbnailUrl').get(function () {
  const thumb = (this.media as MediaAsset[]).find((m) => m.type === 'thumbnail');
  return thumb?.url ?? null;
});

ListingSchema.virtual('priceFormatted').get(function () {
  const p = this.price as PricingInfo;
  if (p.isFree) return 'Free';
  return `${p.currency} ${(p.amountCents / 100).toFixed(2)}`;
});