import jwt from 'jsonwebtoken';

export interface UserPayload {
    sub: string;
    accountId: string,
    deviceId: string,
    role: 'user' | 'admin';
}

export function verifyToken(token: string): UserPayload {
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
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
