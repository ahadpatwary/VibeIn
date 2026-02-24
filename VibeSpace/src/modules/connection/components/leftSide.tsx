
function LeftSide() {
  return (
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
  )
}

export default LeftSide