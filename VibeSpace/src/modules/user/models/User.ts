import mongoose, { Schema, Types, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phoneNumber: string;
  profilePicture:{
    url: string ;
    public_id: string | null; 
  };
  dateOfBirth: Date;
  friendsCount: number,
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      default:"<User>"
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


const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
