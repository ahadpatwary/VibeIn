
function CreatePostUsingAi({setAi}: {setAi: React.Dispatch<React.SetStateAction<boolean>>}) {

    const aiInfo = {
        description: "Generate engaging posts for your audience with AI. Just fill out the details, and let AI handle the rest.",
        options: [
        {
            marker: '🤖',
            title: 'AI-Powered Content',
            about: 'Get creative and relevant content instantly.'
        },
        {
            marker: '⚡',
            title: 'Save Time',
            about: 'Create posts in seconds with minimal effort'
        },
        {
            marker: '⭐',
            title: 'High Quality',
            about: 'Well-structured and audience-focused output.'
        }
        ],
        fotterInfo: 'Join professionals worldwide and build meaningful connections.'
    }
  return (
    <div className="mt-10 space-y-6 p-2 max-w-lg min-w-[310px] sm:mx-auto md:mx-1">

      <div className={` `}>
        <span className="text-3xl font-medium text-gray-400 tracking-wide">
            VibeIn
        </span>

        <h1 className="mt-2 text-4xl font-semibold text-white leading-tight">
          Create Post Using AI.
        </h1>
      </div>

      <p className="mt-6 text-lg text-gray-300 leading-relaxed">
        Generate engaging posts for your audience with AI.
        Just fill out the details and let our AI handle the rest of the work.
      </p>

      {
        (aiInfo.options).map((option, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg 
                      bg-gray-800 border border-gray-700 text-sm font-semibold text-white">
              {option.marker}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {option.title}
              </h3>
              <p className="text-sm text-gray-400">
                {option.about}
              </p>
            </div>
          </div>
        ))
      }


        <button
          className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition"
          onClick={() => setAi((prev) => !prev)}
        >
          Generate Post
        </button>

      <div className='pt-10 border-t my-2 border-gray-800'>
        <p 
          className='text-xs text-gray-500'
        >
          Automated content creation for effortless posting
        </p>
      </div>


    </div>
  )
}

export  { CreatePostUsingAi }