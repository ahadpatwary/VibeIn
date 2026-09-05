import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthProvider = 'credentials' | 'google' | 'github';

@Schema({ timestamps: true })
export class Account extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ['credentials', 'google', 'github'] })
    provider!: AuthProvider;

    // credentials -> email; google/github -> provider's unique "sub"/"id"
    @Prop({ required: true })
    providerAccountId!: string;

    // only set when provider 
    @Prop({ select: false })
    passwordHash?: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// 🔑 Global uniqueness: same google/github account can't attach to two different users
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

// 🔑 One provider per user: ekjon user er duita google account link thakte parbe na
AccountSchema.index({ userId: 1, provider: 1 }, { unique: true });

AccountSchema.pre('validate', function() {
    if(this.provider === 'credentials' && !this.passwordHash) {
        throw new Error('passwordHash must be required')
    }

    if(this.provider !== 'credentials' && this.passwordHash) {
        throw new Error('passwordHash must be empty')
    }

})