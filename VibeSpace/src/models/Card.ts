import mongoose, { Schema, Document, Types, CallbackError } from "mongoose";
import User from "@/models/User";

export interface ICard extends Document {
  user: Types.ObjectId;
  name: string;
  proPic?: { url: string; public_id: string };
  image?: { url: string; public_id: string };
  title: string;
  description: string;
  videoPrivacy: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "There are no description here!",
    },
    videoPrivacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

// Pre-remove hook: remove references from Users

cardSchema.post("findOneAndDelete", async function (doc, next) {
  try {
    if (doc) {
      const cardId = doc._id;

      // একসাথে তিনটা relation থেকে card ID remove করা
      await Promise.all([
        User.updateMany({ cards: cardId }, { $pull: { cards: cardId } }),
        User.updateMany({ likedCards: cardId }, { $pull: { likedCards: cardId } }),
        User.updateMany({ savedCards: cardId }, { $pull: { savedCards: cardId } }),
      ]);
    }

    next();
  } catch (error) {
    console.error("❌ Error cleaning up card references:", error);
    next(error as CallbackError);
  }
});


// Prevent model overwrite in Next.js
const Card = mongoose.models.Card || mongoose.model<ICard>("Card", cardSchema);
export default Card;