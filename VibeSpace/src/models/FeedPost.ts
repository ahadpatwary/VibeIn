import mongoose, { Schema, Document, Types, CallbackError } from "mongoose";

export interface IFeedSchema extends Document {
  authorId: Types.ObjectId;
  title: string;
  caption?: string;
  media: Types.ObjectId[],
  videoPrivacy: "public" | "friends" | "private";
  extraInfo: {
    like: number,
    comment: number,
    share: number,
  }
}

const feedSchema = new Schema<IFeedSchema>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    caption: {
      type: String,
      trim: true
    },

    media: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FeedMedia'
      }
    ],

    videoPrivacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },

    extraInfo: {
      like: {
        type: Number,
        default: 0
      }, 
      comment: { 
        type: Number,
        default: 0
      },
      share: {
        type: Number,
        default: 0,
      }
    }
    
  },
  { timestamps: true }
);

const FeedPost = mongoose.models.FeedPost || mongoose.model<IFeedSchema>("FeedPost", feedSchema);
export default FeedPost;