import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroupConversation extends Document {
    groupName: string;
    groupPicture: {
        public_id: string;
        url: string;
    };
    groupBio?: string;
    groupAdmin: Types.ObjectId;
    participants: Types.ObjectId[];
    deletedBy: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    reqestUser: Types.ObjectId[];
    blockedUser: Types.ObjectId[];
}

const groupConversationSchema = new Schema<IGroupConversation>(
  {
    groupName: {
        type: String,
        required: true,
        trim: true,
    },

    groupPicture: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
    },

    groupBio: { type: String },

    groupAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    participants: [  //leav group  // group theke ber kore deoya,, // group user //
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],

    deletedBy: [   
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: [],
        },
    ],

    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },

    requestUser: [ 
        { 
            types: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    blockedUser: [
        {
            types: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

  },
  { timestamps: true }
);

const groupConversation =
  mongoose.models.GroupConversation ||
  mongoose.model<IGroupConversation>(
    'GroupConversation',
    groupConversationSchema
  );

export default groupConversation;