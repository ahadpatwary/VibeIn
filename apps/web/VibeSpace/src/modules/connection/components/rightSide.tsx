import React from 'react'

function RightSide({ className }: { className?: string }) {
    return (
        <div className={`${className} p-6 border-l border-border flex-1 bg-card`}>
            <div className="w-full space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Suggested for you</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-background p-4 rounded-xl border border-border hover:border-primary transition">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://i.pravatar.cc/150?img=5"
                                alt="profile"
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="text-sm font-medium text-foreground">Alex Smith</p>
                                <p className="text-xs text-muted-foreground">3 mutual</p>
                            </div>
                        </div>

                        <button className="text-sm px-3 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition">
                            Connect
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RightSide