import mongoose, { Types, Schema, Document } from 'mongoose'

export interface IRelation extends Document {
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
    state: 'connected' | 'requested' | 'blocked'
}

const relationSchema = new Schema<IRelation>({
    conversationId: {
        type: Types.ObjectId,
        ref: 'Conversation',
        required: true
    },

    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },

    state: {
        type: String,
        enum: ['connected', 'requested', 'blocked'],
        default: 'requested'
    }

}, { timestamps: true })

relationSchema.index(
  { conversationId: 1, userId: 1 },
  { unique: true }
)

relationSchema.index({ userId: 1 })

const Relation = 
    mongoose.models.Relation || mongoose.model<IRelation>('Relation', relationSchema )
;

export default Relation;