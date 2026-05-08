import { NextRequest } from "next/server";

export function getAuthorizeToken (req: NextRequest) {
    
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    return token;
}