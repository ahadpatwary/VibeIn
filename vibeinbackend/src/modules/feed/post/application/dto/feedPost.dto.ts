import { object, z } from 'zod'
import { Types } from 'mongoose'

const objectIdSchema = z.string()
    .refine(val => Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId'
    })
    .transform(val => new Types.ObjectId(val))
;

const extraInfoSchema = z.object({
    like: z.number().default(0),
    comment: z.number().default(0),
    share: z.number().default(0),
})

export const feedPostDto = z.object({
    authorId: objectIdSchema,
    title: z.string().trim().min(1, "Title cannot be empty"),
    caption: z.string().trim().min(1, "Caption cannot be empty").optional(),
    media: z.array(objectIdSchema),
    videoPrivacy: z.enum(['public', 'friends', 'private']),
    extraInfo: extraInfoSchema.optional().default({
        like: 0,
        comment: 0,
        share: 0,
    }),
})


export const createFeedPostDto = z.object({
    authorId: objectIdSchema,
    title: z.string().trim().min(1, "Title connot be empty"),
    caption: z.string().trim().min(1, "Caption cannot be empty").optional(),
    media: z.array(z.unknown()),
    videoPrivacy: z.enum(['public', 'friends', 'private']),
})

    // media: z.array(z.object({url: z.string(), public_id: z.string()})),

export class CreateFeedPostBody {
    authorId: Types.ObjectId
    title: string;
    caption: string;
    media: unknown[];
    videoPrivacy: 'public' | 'friends' | 'private';
}

export type CreateFeedPost = z.infer<typeof createFeedPostDto>;