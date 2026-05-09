export interface VerifyResponse {
    valid: boolean;
}

export async function verifyToken(token: string): Promise<boolean> {
    // Placeholder implementation; wire this to your real CloudDecode API later.
    return Promise.resolve(Boolean(token && token.length > 0));
}
