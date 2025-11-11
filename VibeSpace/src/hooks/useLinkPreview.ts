import { useEffect } from 'react'


export const useLinkPreview = (url: string) => {
    
    useEffect(() => {
        ;(async() => {
            try {
                
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/linkPreview', {
                    method: "POST", 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({url})
                })

                const data = res.json();
                console.log(data);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();

    }, [url])
}