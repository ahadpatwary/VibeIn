// 'use client'

// import { useCallback, useState } from 'react'
// import { useDropzone } from 'react-dropzone'

// type PreviewFile = File & {
//   preview: string
// }

// export default function UploadBox() {
//   const [files, setFiles] = useState<PreviewFile[]>([])

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const mappedFiles = acceptedFiles.map((file) =>
//       Object.assign(file, {
//         preview: URL.createObjectURL(file),
//       })
//     )

//     setFiles((prev) => [...prev, ...mappedFiles])
//   }, [])

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       'image/*': [],
//       'video/*': [],
//     },
//     multiple: true,
//   })

//   const removeFile = (name: string) => {
//     setFiles((prev) => prev.filter((file) => file.name !== name))
//   }

//   return (
//     <div className="w-full max-w-2xl mx-auto">
//       {/* Drop Zone */}
//       <div
//         {...getRootProps()}
//         className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition 
//         ${
//           isDragActive
//             ? 'bg-blue-100 border-blue-400'
//             : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
//         }`}
//       >
//         <input {...getInputProps()} />

//         <div className="flex flex-col items-center gap-2">
//           <p className="text-lg font-semibold text-gray-700">
//             Drag & Drop files here
//           </p>
//           <p className="text-sm text-gray-500">
//             অথবা click করে image/video select করো
//           </p>
//         </div>
//       </div>

//       {/* Preview Section */}
//       {files.length > 0 && (
//         <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
//           {files.map((file) => (
//             <div
//               key={file.name}
//               className="relative rounded-xl overflow-hidden shadow-sm border"
//             >
//               {/* Image Preview */}
//               {file.type.startsWith('image') ? (
//                 <img
//                   src={file.preview}
//                   className="w-full h-40 object-cover"
//                 />
//               ) : (
//                 <video
//                   src={file.preview}
//                   className="w-full h-40 object-cover"
//                   controls
//                 />
//               )}

//               {/* Remove Button */}
//               <button
//                 onClick={() => removeFile(file.name)}
//                 className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

type UploadFile = File & {
  preview: string
  progress?: number
  status?: 'uploading' | 'done' | 'error'
}

export default function UploadBox() {
  const [files, setFiles] = useState<UploadFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mapped: UploadFile[] = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading' as const,
      })
    )

    setFiles((prev) => [...prev, ...mapped])
    uploadFiles(mapped)
  }, [])

  const uploadFiles = async (filesToUpload: UploadFile[]) => {
    const signatureRes = await fetch('https://vibein-2hk5.onrender.com/storage/signed-url', {
      method: 'POST',
    })

    const { timestamp, signature, cloudName, apiKey, uploadPreset } =
      await signatureRes.json()

    await Promise.all(
      filesToUpload.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)
        formData.append('upload_preset', uploadPreset)

        const xhr = new XMLHttpRequest()

        xhr.open(
          'POST',
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
        )

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total)

            setFiles((prev) =>
              prev.map((f) =>
                f.name === file.name ? { ...f, progress: percent } : f
              )
            )
          }
        }

        xhr.onload = () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: 'done' } : f
            )
          )
        }

        xhr.onerror = () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: 'error' } : f
            )
          )
        }

        xhr.send(formData)
      })
    )
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
    },
    multiple: true,
  })

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

      {/* Preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {files.map((file) => (
          <div key={file.name} className="border rounded-xl overflow-hidden">
            {file.type.startsWith('image') ? (
              <img
                src={file.preview}
                className="w-full h-40 object-cover"
              />
            ) : (
              <video
                src={file.preview}
                className="w-full h-40 object-cover"
              />
            )}

            {/* Progress */}
            <div className="p-2">
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${file.progress}%` }}
                />
              </div>

              <p className="text-xs mt-1">
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