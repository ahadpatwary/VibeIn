import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Model } from "mongoose";

export type MediaDocument = Media & Document;


@Schema({_id: false})
class Content {
    @Prop({
        type: String,
        required: true
    })
    url: string;

    @Prop({
        type: String,
        required: true
    })
    public_id: string;

}

const ContentScheam = SchemaFactory.createForClass(Content);

@Schema({_id: false})
class Thumbnail {
  @Prop({
    type: String,
    default: null,
  })
  url?: string | null;

  @Prop({
    type: String,
    default: null
  })
  public_id?: string | null;

}

const ThumbnailSchema = SchemaFactory.createForClass(Thumbnail);

export type MediaType = 'video' | 'image';


@Schema()
export class Media {
    @Prop({
        type: String,
        enum: ['video', 'image'],
        required: true
    })
    type: MediaType;

    @Prop({
        type: ContentScheam,
        required: true
    })
    content: Content;

    @Prop({
        type: ThumbnailSchema,
        default: undefined,
    })
    thumbnail: Thumbnail;

}

export const MediaSchema = SchemaFactory.createForClass(Media);


MediaSchema.pre('validate', async function () {

    if (this.type === 'image' && this.thumbnail) {
        throw new Error(
            "You coan't send thumbnail to database for image upload",
        );
    }
});