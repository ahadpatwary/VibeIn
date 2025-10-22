import Message from './../../../../../ChatLoop/src/models/Message';
import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/db';

export async function POST(req: Request){
    try {

        const {userId, chatWith } = await req.json();

        await connectToDb();

        const messages = await Message.find({
            $or: [
            { sender: userId, receiver: chatWith },
            { sender: chatWith, receiver: userId },
            ]
        }).sort({ createdAt: 1 });

        return NextResponse.json(
            { messages: messages },
            { status: 200 },
        );

    } catch (error) {
        if(error instanceof Error){
            console.error(error.message);
        }
        return NextResponse.json(
            { messages: null },
            { status: 500} 
        )
    }
}