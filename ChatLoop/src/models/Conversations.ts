import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  type: 'oneToOne' | 'group';

  participants: Types.ObjectId[];
  deletedBy: Types.ObjectId[];
  blockedUser: Types.ObjectId[];
  requestUser: Types.ObjectId[];

  lastMessage?: Types.ObjectId;
  lastMessageTime?: Date;

  extraFields?: {
    groupName?: string;
    groupPicture?: {
      public_id: string;
      url: string;
    };
    groupBio?: string;
    groupAdmin?: Types.ObjectId;
  };
}

const extraFieldsSchema = new Schema(
  {
    groupName: { type: String, trim: true },
    groupPicture: {
      public_id: { type: String },
      url: { type: String },
    },
    groupBio: { type: String },
    groupAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['oneToOne', 'group'],
      default: 'oneToOne',
    },

    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    deletedBy: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    blockedUser: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    requestUser: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    
    lastMessageTime: { type: Date, default: null },

    extraFields: {
      type: extraFieldsSchema,
      required: function (this: IConversation) {
        return this.type === 'group';
      },
    },
  },
  { timestamps: true }
);

// Index for per-user feed + cursor-based pagination
conversationSchema.index({ participants: 1, lastMessage: -1 });
conversationSchema.index({ type: 1, lastMessage: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', conversationSchema)
;

export default Conversation;