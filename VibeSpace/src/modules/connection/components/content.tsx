import React from "react"

function Content({ className }: { className?: string }) {
    return (
        <div className={`${className} flex flex-col flex-[2] overflow-y-auto max-w-3xl mx-auto p-1 space-y-6 min-h-0`}>

            {/* SEARCH SECTION */}
            <div className="border border-gray-800 rounded-xl p-4">
                <input
                    type="text"
                    placeholder="Search connections..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* SCROLLABLE LIST */}
            <div className="space-y-4 pr-2">

                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="border border-gray-800 rounded-sm p-2 flex items-center justify-between gap-2
                        hover:border-gray-700 transition"
                    >

                        {/* LEFT PROFILE INFO */}
                        <div className="flex items-center gap-2">
                            <img
                                src="https://i.pravatar.cc/150?img=3"
                                alt="profile"
                                className="w-14 h-14 rounded-full object-cover"
                            />

                            <div>
                                <h3 className="font-semibold text-white text-lg">John Doe</h3>
                                <p className="text-sm text-gray-400">
                                    Software Engineer • 12 mutual connections
                                </p>
                                <p className="text-gray-600">{`Connected on December 13:12`}</p>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-sm font-medium">
                                M
                            </button>

                            <button className="rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium">
                                .
                            </button>
                        </div>

                    </div>
                ))}

            </div>
        </div>
    )
}

export default Content