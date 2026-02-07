import mongoose, { Schema, Types, Document } from "mongoose";

interface ILike extends Document {
    userId: Types.ObjectId; 
    postId: Types.ObjectId;        
}

const likeSchema = new Schema<ILike>({
    userId: {
        types: Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    
    postId: { 
        types: Types.ObjectId, 
        ref: "FeedPost", 
        required: true 
    }

}, { timestamps: true })

const LikePost = mongoose.models.LikePost || mongoose.model<ILike>("LikePost", likeSchema);
export default LikePost;