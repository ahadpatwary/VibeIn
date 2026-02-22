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
        const fetchPosts = async () => {
            try {
                const res = await fetch(
                    process.env.NODE_ENV === "development"
                        ? "http://localhost:3000/feed"
                        : "https://vibein-2hk5.onrender.com/feed"
                    // "https://vibein-2hk5.onrender.com/feed"
                );
                const data = await res.json();
                console.log("post", data);
                setActivePosts(data);
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };

        fetchPosts();
    }, []);

    return { activePosts };
} 