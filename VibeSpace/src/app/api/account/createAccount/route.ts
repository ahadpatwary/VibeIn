import Account from '@/models/Account';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose'
import User from '@/models/User';
import { z } from "zod";

const baseAuthSchema = z.object({
  type: z.enum(["credentials", "google", "github"]),
  providerId: z.string().optional(),
  name: z.string().trim().optional(),
  profilePicture: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});


export const authSchema = baseAuthSchema.superRefine((data, ctx) => {

    // credentials login
    if (data.type === "credentials") {
        if (!data.password) {
            ctx.addIssue({
                path: ["password"],
                message: "Password is required for credentials login",
                code: z.ZodIssueCode.custom,
            });
        }
    }

    // OAuth login
    if (data.type !== "credentials") {
        if (!data.providerId) {
            ctx.addIssue({
                path: ["providerId"],
                message: "Provider ID is required for OAuth login",
                code: z.ZodIssueCode.custom,
            });
        }
    }
  }
);

export type AuthSchemaType = z.infer<typeof authSchema>;



export async function POST (req: Request) {
    try {
        
        const body: AuthSchemaType = await req.json();

        const result = authSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error.format() },
                { status: 400 }
            );
        }

        const { type } = body;

        const user = await User.create({
            name: type === 'credentials' ? body.name || "<User>" : "<User>",
            profilePicture: {
                url: type === 'credentials' ? body.profilePicture : "",
                public_id: type !== 'credentials' ? null : "",
            }
        });

        const userId = user._id;

        ( type === 'credentials' ) ? await Account.create({
            type: 'credentials',
            email: body.email,
            password: body.password, 
            authorId: new Types.ObjectId(userId) 
        }) : await Account.create({
            type: type,
            email: body.email,
            authorId: new Types.ObjectId(userId)
        })

        return NextResponse.json(
            { message: 'Account created successfully!', userId: userId },
            { status: 200 }
        )

    } catch (error) {
        if(error instanceof Error){
            throw new Error(error.message);
        }
    }
}