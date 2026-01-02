import mongoose, { Types, Schema, Document } from 'mongoose'

export interface IGroupMessage extends Document {
    groupId: Types.ObjectId,
    senderId: Types.ObjectId,
    text: string,
    referenceMessage: Types.ObjectId
    messageTime: number
}


const groupMessageSchema = new Schema<IGroupMessage>(
    {
        groupId: {
            type: Schema.Types.ObjectId,
            ref: 'GroupConversation',
            required: true,
            index: true,
        },

        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true
        },

        referenceMessage: {
            type: Schema.Types.ObjectId,
            ref: 'GroupMessage',
            default: null
        },
        messageTime: {
            type: Number,
            required: true
        }

    },{ timestamps: true}
)

const groupMessage = 
  mongoose.models.GroupMessage ||
  mongoose.model<IGroupMessage>(
    'GroupMessage',
    groupMessageSchema
  )
;

export default groupMessage;