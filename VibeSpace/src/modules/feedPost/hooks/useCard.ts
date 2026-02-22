import { useEffect, useState } from "react"


import { z } from 'zod';

export const feedPosts = z.object({
    _id: z.string(),
    authorId: z.object({
        _id: z.string(),
        name: z.string().trim().min(1, "name connot be empty"),
        profilePicture: z.object({
            url: z.string().nullable(),
            public_id: z.string().nullable()
        })
    }),
    title: z.string().trim().min(1, "Title cannot be empty"),
    caption: z.string().trim().min(1, "Caption cannot be empty").optional(),
    media: z.array(
        z.object({
            _id: z.string(),
            type: z.enum(['image', 'video']),
            content: z.object({
                url: z.string(),
                public_id: z.string()
            })
        })
    ),
    videoPrivacy: z.enum(['public', 'friends', 'private']),
    extraInfo: z.object({
        like: z.number().min(0),
        comment: z.number().min(0),
        share: z.number().min(0)
    })
})

export type feedPostsType = z.infer<typeof feedPosts>;



export const useCard = () => {

    const [activePosts, setActivePosts] = useState<feedPostsType[] | []>([]);


    useEffect(() => {

        (async() => {
            const getPublicPost = await fetch('http://localhost:3000/feed/');

            const post = await getPublicPost.json();

            setActivePosts(post);
        })();

    }, [])

    return { activePosts };
} 