// src/types/global.d.ts
declare global {
    interface ICard{
        _id: Types.ObjectId;
        user: Types.ObjectId;
        name: string;
        proPic:{
            url: string;
            public_id: string;
        };         
        image?: {
            url: string;
            public_id: string;
        };                 
        title: string;                 
        description?: string;           
        videoPrivacy: "public" | "private";

        createdAt: Date;
        updatedAt: Date;
    }
}

export {}; // এটা লাগবে otherwise file global declare হিসেবে recognize হবে না


// এরপর import ছাড়াই যেকোনো file এ TypeScript এটা recognize করবে।

// Next.js project এ tsconfig.json এ typeRoots / include ঠিক করে দিতে হবে যাতে global.d.ts include হয়।