import mongoose, { Schema, Types, Document } from "mongoose";

interface ISave extends Document {
    userId: Types.ObjectId; 
    postId: Types.ObjectId;        
}

const saveSchema = new Schema<ISave>({
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

const SavePost = mongoose.models.Like || mongoose.model<ISave>("SavePost", saveSchema);
export default SavePost;