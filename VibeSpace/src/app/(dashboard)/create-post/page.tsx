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
    <div className=" text-white min-h-screen">

      <div className="max-w-7xl mx-auto min-h-screen flex p-2 justify-between items-center">

        {/* <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Create Post Using AI</h1>
          <p className="text-gray-400 mb-8">
            Generate engaging posts for your audience with AI. Just fill out the details, and let AI handle the rest.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">🤖</div>
              <div>
                <h3 className="font-semibold">AI-Powered Content</h3>
                <p className="text-gray-400 text-sm">Get creative and relevant content instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">⚡</div>
              <div>
                <h3 className="font-semibold">Save Time</h3>
                <p className="text-gray-400 text-sm">Create posts in seconds with minimal effort.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-500/20 p-3 rounded-xl">⭐</div>
              <div>
                <h3 className="font-semibold">High Quality</h3>
                <p className="text-gray-400 text-sm">Well-structured and audience-focused output.</p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="mt-10 space-y-6">
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
        </div>



        <Card className="p-8 rounded-2xl max-w-md w-full shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Create Post Using AI</h2>

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
  )
}

export default CreatePost