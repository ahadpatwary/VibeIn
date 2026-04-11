'use client'

import { Button } from "@/shared/components/ui/button"
import { useRouter } from "next/navigation"

function Nav() {
    const router = useRouter()

    return (
        <nav className="w-full bg-background/90 backdrop-blur-sm border sticky top-0 z-30  ">
            <div className="w-full sticky top-0 flex justify-between items-center px-6 py-4 bg-[#242427] border-b border-white/10">
                <p className="text-3xl font-semibold text-blue-400">VibeIn</p>

                <div className="flex items-center gap-6 text-sm text-gray-300">
                    <span className="cursor-pointer hover:text-white hidden sm:block">Home</span>
                    <span className="cursor-pointer hover:text-white hidden sm:block">About</span>
                    <span className="cursor-pointer hover:text-white hidden sm:block">Support</span>
                    <Button 
                        className="cursor-pointer" 
                        onClick={() => { router.push('/login')}}
                    >
                        Login
                    </Button>
                </div>
            </div>
        </nav>

    )
}

export default Nav