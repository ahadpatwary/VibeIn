import mongoose, { Schema, Types, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  profilePicture:{
    url: string ;
    public_id: string; 
  };
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
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

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

  },
  { timestamps: true }
);


const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;