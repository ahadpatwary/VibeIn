import { connectToDb } from "@/lib/db";
import { getRedisClient } from "@/lib/redis";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

interface response {
    _id: string,
    name: string,
    friends: [
        {
            _id: string, 
            name: string, 
            email: string
        }
    ]
}

function buildRegexQuery(query: string) {

  if (!query) return {};
  const words = query.split(/\s+/);
  return {
    $and: words.map((word: string) => ({ name: { $regex: `^${word}`, $options: "i" } })),
  };
}

async function computeMutualFriends(userId: string, candidates: response[]) {
  const currentUser = await User.findById(userId).select("friends");
  const friendIds = currentUser.friends.map((id: string) => id.toString());

  return candidates.map((user) => {
    const theirFriends = user.friends.map((id) => id.toString());
    const mutualCount =
      theirFriends.filter((fid) => friendIds.includes(fid)).length || 0;
    return { _id: user?._id as string, name: user?.name as string, mutualCount };
  });
}

export const POST = async (req: Request) => {
    try {
        console.log("Yes comming");
        const body = await req.json();
        let { userId, query } = body;

        userId = "6966deb5fb002239ebb26801";
        console.log("userId", userId);
 
        if(!userId || !query) return NextResponse.json(
            { message: "userId must be required" },
            { status: 401 }
        )

        const page = parseInt(body?.page || "1");
        const limit = parseInt(body?.limit || "20");
        
        // const cacheKey = `search:${userId}:${query.toLowerCase().trim()}:${page}:${limit}`;

        const Redis = getRedisClient();
        await connectToDb();

        if(!Redis) return NextResponse.json(
            { message: "redis not connected" },
            { status: 501 }
        )

        //................................. redis cached search .......................
        // // const cachedUser = await Redis.get(cacheKey);

        // if(cachedUser) return NextResponse.json(
        //     { users: JSON.parse(cachedUser) },
        //     { status: 200 }
        // )

        const currentUser = await User.findById(userId).select("friends");

        const friendIds = currentUser.friends || [];

        const friendsSearch: response[] = await User.find({
        _id: { $in: friendIds },
        ...buildRegexQuery(query),
        })
        .limit(limit)
        .select("_id name friends");


        if(friendsSearch.length > 0) {
            const resultWithMutual = await computeMutualFriends(userId, friendsSearch);
            // await Redis.set(cacheKey, 900, JSON.stringify(resultWithMutual));
            return NextResponse.json(
                { users: resultWithMutual },
                { status: 200 }
            )
        }


        const globalSearch = await User.aggregate([
            {
                $search: {
                    index: "name_search",
                    autocomplete: {
                        query: query,
                        path: "name",
                        fuzzy: {
                            maxEdits: 2,
                            // prefixLength: 0,
                            // maxExpanstions: 50
                        }
                    }
                }
            },
            { $match: {_id: { $ne: userId } } },
            { $project: { _id: 1, name: 1, friends: 1} },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ])
        console.log("globalS", globalSearch);

        const resultWithMutualGlobal = await computeMutualFriends(userId, globalSearch);
        
        // await Redis.set(cacheKey, 900, JSON.stringify(resultWithMutualGlobal));

        return NextResponse.json(
            { users: resultWithMutualGlobal },
            { status: 200 }
        )

    } catch (error) {
        NextResponse.json(
            { message: "internal server errordfd"}, 
            { status: 500 }
        )

        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}