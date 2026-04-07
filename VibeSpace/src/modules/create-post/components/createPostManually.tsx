'use client'
import { Card } from "@/shared/components/ui/card"
import { useRouter } from "next/navigation"


function CreatePostManually() {
    const router = useRouter()

    const handleClick = () => {
        console.log("feed")
        router.push('/example');
    }
  return (
    <div className='w-full flex justify-center my-3 h-auto md:p-2'>
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
                    <button 
                        type="button"
                        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center text-gray-400 w-full"
                        onClick={handleClick}
                    >
                        Upload an image or video
                    </button>
                </div>

                <button
                    type="button"
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition">
                    Spike
                </button>
            </form>
        </Card>
    </div>
  )
}

export default CreatePostManually