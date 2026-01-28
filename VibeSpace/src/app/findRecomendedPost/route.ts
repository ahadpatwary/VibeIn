// 1st =>  friend post
// 2nd => friend commented post
// 3rd => friend liked post
// 4th => mutual friend post 
// 5th => random post 

// final all post id (200) sortend on random ordered 
// store on redis 

import { connectToDb } from '@/lib/db';
import { getRedisClient } from '@/lib/redis';
import FeedPost from '@/models/FeedPost';
import Friend from '@/models/Friend';
import LikePost from '@/models/Like';
import User from '@/models/User';
import { Scan } from 'lucide-react';
import { NextResponse } from "next/server";


export const POST = async (req: Request) => {
    try {

        const body = await req.json();
        const { userId } = body;

        if(!userId) return NextResponse.json(
            { message: "userId must be required" },
            { status: 403 }
        )

        await connectToDb();
        const Redis = getRedisClient();

        if(!Redis) return NextResponse.json(
            { message: "Redis not successfully connected" },
            { status: 503 }
        )

        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); //10 days

        // ... friendpost ids

        const friendIdObjects = await Friend.find( 
            { panding: false,  users: { $in: [userId] } },  //filter
            {_id: 0, friends: 1}) // projection
            .lean()
        ;

        const friendIds = friendIdObjects.map((friendIdObject) =>{
            return friendIdObject.users[0] === userId ?
                friendIdObject.user[1] : friendIdObject.user[0]
            ;
        });


        const friendPostIds = await FeedPost.find(
            {
                authorId: { $in: friendIds },
                createdAt: { $gte: tenDaysAgo }
            },
            { _id: 1 }
        ).sort({ createdAt: -1 }).limit(300);


        // const friendCommentPostIds = await Comment.find({
        //     authorId: { $in: friendIds },
        //     createAt: { $gte: tenDaysAgo }
        // }, { _id: 0, postId: 1 }).sort({ createdAt: -1 }).limit(200);

        const friendLikePostIds = await LikePost.find(
            {
                authorId: { $in: friendIds },
                createAt: { $gte: tenDaysAgo }
            }, 
            { _id: 0, postId: 1 }
        ).sort({ createAt: -1 }).limit(200);

        const mutualFriendIds = await Friend.find(
            {
                users: { $in: friendIds }
            },
            { _id: 0, users: 1}
        ).sort({ createAt: -1 }).limit(200);

        const mutualFriendPostIds = await FeedPost.find(
            {
                authorId: { $in: mutualFriendIds },
                createdAt: { $gte: tenDaysAgo }
            },
            { _id: 1 }
        ).sort({ createdAt: -1 }).limit(200);


        let ids = [
            ...friendPostIds,
            ...friendLikePostIds,
            ...mutualFriendPostIds,
        ];

        const randomPostIds = await FeedPost.find(
            {
                authorId: { $nin: ids },
                createdAt: { $gte: tenDaysAgo }
            },
            { _id: 1 }
        ).sort({ score: -1 }).limit(200);

        ids = [ ...ids , ...randomPostIds ];

        const uniqueIds = [...new Set(ids.map(id => id.toString()))];

        // shuffle + ranking
        // const ranked = smartShuffle(uniqueIds);

        // final feed
        const feedIds = uniqueIds.slice(0, 200);

        // Redis store
        await Redis.set(
            `feed:${userId}`,
            JSON.stringify(feedIds),
            'EX',
            600
        );
        
    } catch (error) {
        if(error instanceof Error) return NextResponse.json(
            { message: `Internal server error ${error.message}`},
            { status: 500 }
        )
    }
}