import mongoose, { Schema, Types, Document } from "mongoose";

interface IUserRelation extends Document {
    user1: Types.ObjectId; 
    user2: Types.ObjectId;
    requestedBy: Types.ObjectId;
    status: 'requested' | 'friend' | 'blocked',
    blockedBy: Types.ObjectId;
}

const userRelationSchema = new Schema<IUserRelation>({
    user1: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    user2: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    status: {
        type: String,
        enum: ['requested', 'friend', 'blocked'],
        default: 'requested'
    },

    blockedBy: {
        type: Types.ObjectId,
        ref: 'User',
        validate: {
            validator: function (this: IUserRelation, value: Types.ObjectId) {
                if (this.status === 'blocked') {
                    return !!value
                }
                return true
            },
            message: 'blockedBy is required when state is blocked'
        }
    }

}, { timestamps: true });

// friendSchema.createIndex({ user1: 1, user2: 1, panding: 1 });
// friendSchema.createIndex({ user1: 1, panding: 1 });
// friendSchema.createIndex({ user2: 1, panding: 1 });


const UserRelation = 
    mongoose.models.UserRelation || mongoose.model<IUserRelation>("UserRelation", userRelationSchema)
;
export default UserRelation;  