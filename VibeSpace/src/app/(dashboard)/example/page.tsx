'use client'

import { useUpload } from '@/shared/hooks/useUpload'
import { useRouter } from 'next/navigation'


export default function UploadBox() {

  const {
    files, 
    getRootProps, 
    getInputProps, 
    isDragActive 
  } = useUpload()

  const router = useRouter();
 
  return (
    <div className="max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-10 rounded-2xl text-center cursor-pointer transition ${
          isDragActive
            ? 'bg-blue-100 border-blue-400'
            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <p className="font-semibold text-lg">Drag & Drop files</p>
        <p className="text-sm text-gray-500">or click to upload</p>
      </div>
      {/* <button onClick={()=> uploadFiles(files)} className='text-white p-2 m-2 rounded'> send </button> */}
      <button onClick={()=> router.push('/create-post')} className='text-white p-2 m-2 rounded border'> back </button>

      {/* Preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {files.map((file) => (
          <div key={file.id} className="border rounded-xl overflow-hidden">
            <img src={file.preview} className="w-full h-40 object-cover" />

            {/* Progress */}
            <div className="p-2">
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${file.progress ?? 0}%` }}
                />
              </div>

              <p className="text-xs text-white mt-1">
                {file.status === 'uploading' && 'Uploading...'}
                {file.status === 'done' && 'Uploaded ✅'}
                {file.status === 'error' && 'Error ❌'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}