import mongoose, { Schema, Types, Document } from 'mongoose'
import bcrypt from "bcryptjs";


export interface ISession extends Document {
    userId: Types.ObjectId,
    deviceIdentity: string,
    refreshTokenHash: string,
    revoked: boolean
}


const sessionSchema = new Schema<ISession> ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    deviceIdentity: {
        type: String,
        required: true
    },

    refreshTokenHash: {
        type: String, 
        required: true
    },

    revoked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

sessionSchema.pre<ISession>('save', async function(next){

    if (this.isModified("refreshTokenHash") && this.refreshTokenHash) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(this.refreshTokenHash, salt);
            this.refreshTokenHash = hash;
        } catch (err) {
            console.error(err);
            next();
        }
    }
    next();
})

const Session = mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);
export default Session;