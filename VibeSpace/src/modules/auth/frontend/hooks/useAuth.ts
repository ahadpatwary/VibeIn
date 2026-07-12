import { useAppDispatch } from "@/shared/lib/hooks";
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { eventObjectSchema } from "../schemas/auth.schema";



export const useAuth = () => {
    // const router = useRouter();
    // const dispatch = useAppDispatch();

    // useEffect(() => {
    //     const handleMessage = (e: MessageEvent) => {

    //         // if provider dosen't given provider ID then return 
    //         if(!(e?.data?.id)) return; 

    //         if()

    //         // validate the message data
    //         const parsed = eventObjectSchema.safeParse({
    //             origin: e.origin,
    //             data: e.data,
    //         })

    //         if (!parsed.success) return;

    //         const event = parsed.data;

    //         // Origin check
    //         if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;

    //         // Type check
    //         const provider = 'GOOGLE';
    //         if(event.data.type !== `${provider}_AUTH_SUCCESS`) return;

    //         // dispatch(setAccessToken(event.data.accessToken));
        
            

    //     };

    //     window.addEventListener("message", handleMessage);
    //     return () => window.removeEventListener("message", handleMessage);
    // }, [])
}