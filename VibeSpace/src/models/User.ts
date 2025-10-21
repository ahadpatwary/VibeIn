import mongoose, { Schema, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  picture:{
    url: string ;
    public_id: string; 
  };
  dob: Date;

  cards: Types.ObjectId[];
  likedCards: Types.ObjectId[];
  savedCards: Types.ObjectId[];

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      default:""
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
      type: String,
      default:""
    },
    picture: {
      url: { type: String, default:""},
      public_id: { type: String, default:""}
    },
    dob: {
      type: Date,
      default: Date.now()
    },

    // Relations
    cards: [{ type: Schema.Types.ObjectId, ref: "Card" }],
    likedCards: [{ type: Schema.Types.ObjectId, ref: "Card" }],
    savedCards: [{ type: Schema.Types.ObjectId, ref: "Card" }],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
    } catch (err) {
      console.error(err);
      next();
    }
  }
  next();
});

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
