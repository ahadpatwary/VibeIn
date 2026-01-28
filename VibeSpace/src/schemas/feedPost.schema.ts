import { z } from 'zod'
import { userSchema } from './user.schema';

export const videoPrivacyEnum = z.enum([
    'public', 'friends', 'private'
]) 

export const extraInfoSchema = z.object({
    like: z.number().int().nonnegative().default(0),
    comment: z.number().int().nonnegative().default(0),
    share: z.number().int().nonnegative().default(0)
})


export const mediaSchema = z.object({
    type: z.enum(['image', 'video']),
    media: z.object({
        url: z.string().trim(),
        public_id: z.string().trim()
    })
})

export const feedPostSchema = z.object({
    authorId: userSchema.pick({
        name: true,
        email: true,
        profilePicture: true
    }),
    title: z.string().trim(),
    caption: z.string().trim().nullable().default(null),
    media: z.array(mediaSchema),
    videoPrivacy: videoPrivacyEnum,
    extraInfo: extraInfoSchema,
})


export const createPostSchema = feedPostSchema.pick({
    title: true,
    caption: true,
    //mdeia
    videoPrivacy: true
})