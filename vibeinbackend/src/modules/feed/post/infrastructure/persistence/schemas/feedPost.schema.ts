import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedPostDocument = FeedPost & Document;

@Schema({ _id: false })
class ExtraInfo {
    @Prop({ default: 0 })
    like: number;

    @Prop({ default: 0 })                                                      
    comment: number;

    @Prop({ default: 0 })
    share: number;
}

const ExtraInfoSchema = SchemaFactory.createForClass(ExtraInfo);


@Schema({ timestamps: true })
export class FeedPost {
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    authorId: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    title: string;

    @Prop({
        type: String,
        trim: true,
    })
    caption?: string;

    @Prop([
        {
            type: Types.ObjectId,
            ref: "Media",
        },
    ])
    media: Types.ObjectId[];

    @Prop({
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
    })
    videoPrivacy: 'public' | 'friends' | 'private';

    @Prop({
        type: ExtraInfoSchema, 
        default: {} 
    })
    extraInfo: ExtraInfo;
}

export const FeedPostSchema = SchemaFactory.createForClass(FeedPost);