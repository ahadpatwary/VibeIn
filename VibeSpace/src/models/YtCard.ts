import mongoose, { Schema, Document, Types, CallbackError } from "mongoose";

export interface IYtCard extends Document {
    user: Types.ObjectId[],
    title: string,
    description: string,
    customThumble: string,
    url: string,
    points: number, 
    pinedByOwner: boolean,
    duration: Date,
}


const YtCardSchema = new Schema<IYtCard> (
    {
        user: {
            Type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            Type: String,
            required: true
        },

        description: {
            Type: String,
            default: ""
        },

        customThumble: {
            type: String,
            default: ""
        },

        url: {
            type: String,
            required: true
        },

        points: {
            type: Number,
            default: 0
        },

        pinedByOwner: {
            type: Boolean,
            default: false
        },

        duration: {
            type: Date,
            default: Date.now()
        }

    }, { timestamps: true }
)


// Prevent model overwrite in Next.js
const YtCard = mongoose.models.YtCard || mongoose.model<IYtCard>("ytCard", YtCardSchema);
export default YtCard;