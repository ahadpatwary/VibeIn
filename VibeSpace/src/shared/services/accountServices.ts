import Account from '@/modules/account/models/Account';
import Session from '@/modules/account/models/session';
import User from '@/modules/user/models/User';
import jwt, { SignOptions } from 'jsonwebtoken'
import { Types } from 'mongoose';

interface payloadType {
    sub: string;
    deviceId: string;
    accountId: string;
}

export async function tokenGenerate(
    payload: payloadType,
    role: string,
    expiresIn: SignOptions["expiresIn"]  
){
    return jwt.sign(
        { ...payload, role },
        process.env.NEXTAUTH_SECRET as string,
        {
            algorithm: "HS256",
            expiresIn,
            notBefore: "0s",
            issuer: "smreaz.com",
            audience: "VibeIn_client",
        }
    );
}

export async function tokenGeneration(userId: string, accountId: string) {

    const deviceId = Buffer.from(crypto.randomUUID()).toString("base64");

    const payload = {
        sub: userId,
        deviceId,
        accountId,
    }

    const accessToken = await tokenGenerate(payload, "user", "15m");
    const refreshToken = await tokenGenerate(payload, "user", "30d");

    const refreshTokenHash = await Session.create({
        userId,
        deviceIdentity: deviceId,
        refreshTokenHash: refreshToken
    });

    return { accessToken, refreshToken, refreshTokenHash };
}


export async function createAccount (
    email: string, 
    authorId: string, 
    password?: string, 
    providerId?: string, 
    providerType?: 'credentials' | 'google' | 'github'
) {

    try {
        
        const account = await Account.create({
            type: providerType,
            email,
            password,
            providerId,
            authorId: new Types.ObjectId(authorId)
        });

        return account._id;

    } catch (error) {
        if(error instanceof Error){
            console.error("Error creating account:", error.message);
        }
    }
}

export async function createUser (name?: string, email?: string, pictureUrl?: string, picturePublicId?: string) {
    try {
        
        const user = await User.create({
            name,
            email,
            dob: Date.now(),
            picture: {
                url: pictureUrl,
                public_id: picturePublicId,
            },
        })

        return user._id;

    } catch (error) {
        if(error instanceof Error){
            console.error("Error creating user:", error.message);
        }
    }
}