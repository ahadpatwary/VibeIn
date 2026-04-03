'use client'
import { CustomInput } from '@/shared/components/Input'
import { Card } from '@/shared/components/ui/card'
import { useState } from 'react'

function CreatePost() {
  const [title, setTitle] = useState<string>("");

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
    <div className="w-full flex justify-center">

      <div className="min-h-dvh flex flex-col md:flex-row items-center text-gray-200 max-w-7xl w-full">



        <div className="mt-10 space-y-6 border-r w-full">

          <div className={`max-w-md w-full`}>
            <span className="text-3xl font-medium text-gray-400 tracking-wide">
                VibeIn
            </span>

            <h1 className="mt-2 text-4xl font-semibold text-white leading-tight">
              Create Post Using AI.
            </h1>
          </div>

          <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-md">
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
          <div className=' w-full flex p-2 border-3 rounded-md'>
            <input type="text" className='flex-1 outline-none border-0' placeholder='Create Post Using AI' />
            <button>post</button>
          </div>

          <div className='pt-10 border-t my-2 border-gray-800'>
            <p 
              className='text-xs text-gray-500'
            >
              Automated content creation for effortless posting
            </p>
          </div>


        </div>



        <div className='w-full md:max-w-sm lg:max-w-lg m-2 flex justify-center my-3 h-auto'>
          <Card className="p-8 rounded-2xl max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-3">Create Post</h2>

            <form className="space-y-5">
              <div>
                <label className="block text-sm mb-2">Title</label>
                <input type="text" placeholder="Enter post title..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>

              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea placeholder="Enter post description..."
                  className="w-full px-4 py-2 r-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
              </div>

              <div>
                <label className="block text-sm mb-2">Image</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center text-gray-400">
                  Drop an image here or click to upload
                </div>
              </div>

              <button
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition">
                Generate Post
              </button>
            </form>
          </Card>
        </div>


      </div>

    </div>
  )
}

export default CreatePost