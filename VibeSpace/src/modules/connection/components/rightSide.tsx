import React from 'react'

function RightSide({ className }: { className?: string }) {
    return (
        <div className={`${className} p-6 border-l border-gray-800 flex-1`}>
            <div className="w-full space-y-6">
                <h2 className="text-lg font-semibold">Suggested for you</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://i.pravatar.cc/150?img=5"
                                alt="profile"
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="text-sm font-medium">Alex Smith</p>
                                <p className="text-xs text-gray-400">3 mutual</p>
                            </div>
                        </div>

                        <button className="text-sm px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 transition">
                            Connect
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RightSide