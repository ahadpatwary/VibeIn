'use client'
import { useRouter } from "next/navigation"

function LeftSide({ className }: { className?: string }) {
    const router = useRouter();
    const handleClick = (route: string) => {
        router.push(route);
    }

    return (
        <div className={`${className} p-6 border-r border-border text-foreground flex-1 overflow-y-auto min-h-0 bg-card`}>
            <div className="w-full space-y-6">
                <h2 className="text-xl font-semibold">Connections</h2>

                <div className="space-y-2">

                    {[...Array(20)].map((_, i) => (
                        <button
                            key={i}
                            className="w-full text-left px-4 py-2 hover:bg-muted transition border-t border-border rounded"
                            // onClick={() => handleClick('/connection/all-connections')}
                            onClick={() => handleClick('/connection/sent-requests')}

                        >
                            All Connections
                        </button>
                    ))}

                </div>
            </div>
        </div>
    )
}

export default LeftSide