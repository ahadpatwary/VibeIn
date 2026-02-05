import jwt from 'jsonwebtoken';

export interface UserPayload {
    sub: string;
    accountId: string,
    deviceId: string,
    role: 'user' | 'admin';
}

export function verifyToken(token: string): UserPayload {
    try {

        console.log("env", process.env.NEXTAUTH_SECRET)
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!, {
            algorithms: ["HS256"],
            issuer: "smreaz.com",
            audience: "VibeIn_client",
            maxAge: "15m",
        }) as UserPayload;

        return decoded; 

    } catch (err) {
        throw new Error('Invalid token');
    }
}
