import mongoose, { Schema, Document } from "mongoose";

export interface IFeedMedia extends Document {
    type: 'image' | 'video',
    media: {
        url: string,
        public_id: string
    },
    thumbnail: string
}

const feedMediaSchema = new Schema<IFeedMedia>({
    type: {
        type: String, 
        enum: ['image', 'video'],
        required: true
    }, 

    media: {
        url : {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true
        }
    },

    thumbnail: {
        type: String // mainly for video
    },

}, { timestamps: true })


const FeedMedia = 
    mongoose.models.FeedMedia || mongoose.model<IFeedMedia>("FeedMedia", feedMediaSchema)
;

export default FeedMedia;