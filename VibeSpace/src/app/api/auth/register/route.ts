import { connectToDb } from '@/lib/db'
import User from '@/models/User'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request : NextRequest){
    try{
        const {email, password} = await request.json()

        if(!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 401 }
            )
        }

        await connectToDb()

        const isExist = await User.findOne({email})

        if(isExist){
            return NextResponse.json(
                { error: "User already exist"},
                { status : 400 }
            )
        }

        await User.create(
            {
                name: "",
                email,
                dob: Date.now(),
                picture:{
                    url:"",
                    public_id:"",
                },
                phoneNumber:"",
                password
            }
        )

        return NextResponse.json(
            { error: "User register successfully"},
            { status: 202}
        )
        
    }catch(err){
        console.log(err);
        return NextResponse.json(
            { error: "Failed to register user"},
            { status: 502}
        )
    }
}