import React from 'react'

function Content() {
  return (
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
  )
}

export default Content