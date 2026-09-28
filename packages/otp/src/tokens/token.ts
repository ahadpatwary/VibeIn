export const OTP_TOKENTS = {
   storeService: Symbol.for('StoreService'),
   optConfig: Symbol.for('OtpConfig'),
};

export interface OtpData {
   hashedOtp: string;
   expiresAt: number; // Unix ms
   attempts: number;
}
