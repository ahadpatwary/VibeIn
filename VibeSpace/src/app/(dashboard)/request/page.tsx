import { MenubarDemo } from "@/shared/components/Bar"

function Page() {
    return (
        <div className="flex flex-col h-dvh text-white">

            {/* Top Navbar */}
            <MenubarDemo />

            {/* Main Layout */}
            <div className="flex flex-1 min-h-0 mt-2 border-t border-gray-800">

                {/* LEFT SIDEBAR */}
                <div className="hidden lg:flex w-1/4 p-6 border-r border-gray-800">
                    <div className="w-full space-y-6">
                        <h2 className="text-xl font-semibold">Connections</h2>

                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                                All Connections
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                                Pending Requests
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                                Sent Requests
                            </button>
                            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                                Suggestions
                            </button>
                        </div>
                    </div>
                </div>

                {/* CENTER SECTION */}
                <div className="flex flex-col flex-1 min-h-0 max-w-3xl mx-auto p-6 space-y-6">

                    {/* Search */}
                    <div className="border border-gray-800 rounded-xl p-4">
                        <input
                            type="text"
                            placeholder="Search connections..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* SCROLLABLE LIST */}
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2">

                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="border border-gray-800 rounded-sm p-2 flex items-center justify-between hover:border-gray-700 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src="https://i.pravatar.cc/150?img=3"
                                        alt="profile"
                                        className="w-14 h-14 rounded-full object-cover"
                                    />

                                    <div>
                                        <h3 className="font-semibold text-lg">John Doe</h3>
                                        <p className="text-sm text-gray-400">
                                            Software Engineer • 12 mutual connections
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-sm font-medium">
                                        Message
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="hidden xl:flex w-1/4 p-6 border-l border-gray-800">
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

            </div>
        </div>
    )
}

export default Page