import mongoose, { Schema, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  provider: "credentials" | "google" | "github";
  password: string | null;
  phoneNumber: string;
  profilePicture:{
    url: string ;
    public_id: string; 
  };
  dateOfBirth: Date;
  friendsCount: number,
}

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

    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      required: true,
    },

    password: {
      type: String, 
      required: function(this: IUser) {
        return this.provider === 'credentials'
      },
      default: null
    },

    phoneNumber: {
      type: String,
      default:""
    },

    profilePicture: {
      url: { 
        type: String,
        default:""
      },
      public_id: { 
        type: String, 
        default:""
      }
    },

    dateOfBirth: {
      type: Date,
      default: Date.now()
    },

    friendsCount: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);


userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password") && this.password) {
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

userSchema.methods.comparePassword = 
  async function ( candidatePassword: string ) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }
;

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
