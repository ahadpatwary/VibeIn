import mongoose, { Types, Schema, Document } from 'mongoose'

export interface IMessage extends Document {
    groupId: Types.ObjectId,
    senderId: Types.ObjectId,
    type: 'text' | 'image' | 'video' | 'audio',
    referenceMessage: Types.ObjectId
    messageTime: number
}


const groupMessageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },

        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        type: {
            type: String,
            enum: ['text', 'image', 'video', 'audio'],
            default: 'text'
        },

        media: {
            type: String,
            text: function(this: IMessage) {
                return this.type === 'text'
            },
            content: {
                url: {
                    type: String,
                    required: true,
                },
                public_id: {
                    type: String,
                    required: true
                }
            }
        },

        referenceMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            default: null
        },

        messageTime: {
            type: Number,
            required: true
        }

    },{ timestamps: true }
)

const groupMessage = 
  mongoose.models.Message || mongoose.model<IMessage>( 'Message', groupMessageSchema )
;

export default groupMessage;