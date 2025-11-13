import {useState, useEffect } from 'react'
interface HookType {
  ogTitle: string;
  ogDescription: string;
  ogImage: { url: string }[];
}

export const useLinkPreview = (url: string) => {
    const [data, setData] = useState<HookType>();
    useEffect(() => {
        ;(async() => {
            try {
                
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/linkPreview', {
                    method: "POST", 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({url})
                })

                const data = await res.json();
                setData(data.result.result);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();

    }, [url])
    return data;
}