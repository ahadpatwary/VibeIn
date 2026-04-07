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


// 'use client'

// import { useCallback, useState } from 'react'
// import { useDropzone } from 'react-dropzone'

// type UploadFile = File & {
//   preview: string
//   progress?: number
//   status?: 'uploading' | 'done' | 'error'
// }

// export default function UploadBox() {
//   const [files, setFiles] = useState<UploadFile[]>([])

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const mapped: UploadFile[] = acceptedFiles.map((file) =>
//       Object.assign(file, {
//         preview: URL.createObjectURL(file),
//         progress: 0,
//         status: 'uploading' as const,
//       })
//     )

//     setFiles((prev) => [...prev, ...mapped])
//     uploadFiles(mapped)
//   }, [])

//   const uploadFiles = async (filesToUpload: UploadFile[]) => {
//     const signatureRes = await fetch('https://vibein-2hk5.onrender.com/storage/signed-url')

//     const { timestamp, signature, public_id  } = await signatureRes.json()

//     console.log(timestamp, signature, public_id);

//     await Promise.all(
//       filesToUpload.map(async (file) => {
//         const formData = new FormData()

// //         api_key:861997738819367
// // timestamp:1771692070
// // signature:36d41db4d8b7913e1d11de3d043054c9e51f5c43
// // public_id:img_1771692070078_447
// // folder:production_assets/profiles
// // tags:user_profile,website_v2
// // context:author=ahad|category=avatar|env=prod
// // overwrite:false
// // access_mode:public
// // unique_filename:true
// // use_filename:false
// // transformation:c_limit,w_1000/q_auto,f_auto
//         formData.append('file', file)
//         formData.append('api_key', '861997738819367')
//         formData.append('timestamp', timestamp.toString())
//         formData.append('signature', signature)
//         formData.append('public_id', public_id)
//         formData.append('folder', 'production_assets/profiles')
//         formData.append('tags', 'user_profile,website_v2')
//         formData.append('context', 'author=ahad|category=avatar|env=prod')
//         formData.append('overwrite', 'false')
//         formData.append('access_mode', 'public')
//         formData.append('unique_filename', 'true')
//         formData.append('use_filename', 'false')
//         formData.append('transformation', 'c_limit,w_1000/q_auto,f_auto')

//         const xhr = new XMLHttpRequest()

//         xhr.open(
//           'POST',
//           `https://api.cloudinary.com/v1_1/dnyr37sgw/auto/upload`
//         )

//         xhr.upload.onprogress = (event) => {
//           if (event.lengthComputable) {
//             const percent = Math.round((event.loaded * 100) / event.total)

//             setFiles((prev) =>
//               prev.map((f) =>
//                 f.name === file.name ? { ...f, progress: percent } : f
//               )
//             )
//           }
//         }

//         xhr.onload = () => {
//           setFiles((prev) =>
//             prev.map((f) =>
//               f.name === file.name ? { ...f, status: 'done' } : f
//             )
//           )
//         }

//         xhr.onerror = () => {
//           setFiles((prev) =>
//             prev.map((f) =>
//               f.name === file.name ? { ...f, status: 'error' } : f
//             )
//           )
//         }

//         xhr.send(formData)
//       })
//     )
//   }

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       'image/*': [],
//       'video/*': [],
//     },
//     multiple: true,
//   })

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* Drop Zone */}
//       <div
//         {...getRootProps()}
//         className={`border-2 border-dashed p-10 rounded-2xl text-center cursor-pointer transition ${
//           isDragActive
//             ? 'bg-blue-100 border-blue-400'
//             : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
//         }`}
//       >
//         <input {...getInputProps()} />
//         <p className="font-semibold text-lg">Drag & Drop files</p>
//         <p className="text-sm text-gray-500">or click to upload</p>
//       </div>

//       {/* Preview */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
//         {files.map((file, index) => (
//           <div key={index} className="border rounded-xl overflow-hidden">
//             {/* {file.type.startsWith('image') ? ( */}
//               <img
//                 src={file.preview}
//                 className="w-full h-40 object-cover"
//               />
//             {/* ) : ( */}
//             {/* //   <video */}
//             {/* //     src={file.preview}
//             //     className="w-full h-40 object-cover"
//             //   />
//             // )} */}

//             {/* Progress */}
//             <div className="p-2">
//               <div className="w-full bg-gray-200 h-2 rounded">
//                 <div
//                   className="bg-blue-500 h-2 rounded"
//                   style={{ width: `${file.progress}%` }}
//                 />
//               </div>

//               <p className="text-xs mt-1">
//                 {file.status === 'uploading' && 'Uploading...'}
//                 {file.status === 'done' && 'Uploaded ✅'}
//                 {file.status === 'error' && 'Error ❌'}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

export interface preSignedUrlReturnType {
  signature: string,
  timestamp: number,
  public_id: string,
}

type UploadFile = File & {
  id: string
  preview: string
  progress?: number
  status?: 'uploading' | 'done' | 'error'
  signedInfo: preSignedUrlReturnType
}

export default function UploadBox() {
  const [files, setFiles] = useState<UploadFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {

    const signatureRes = await fetch(`https://vibein-2hk5.onrender.com/storage/signed-url?count=${files.length}`);
    
    const signatureResJson = await signatureRes.json()
    console.log("sig", signatureResJson);

    const mapped: UploadFile[] = acceptedFiles.map((file, index) =>
      Object.assign(file, {
        id: crypto.randomUUID(), // unique id for React and state tracking
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading' as const,
        signedInfo: {
          ...signatureResJson[index]
        }
      })
    )

    console.log("file", acceptedFiles[0]);

    setFiles((prev) => [...prev, ...mapped])
  }, [])

  const uploadFiles = async (filesToUpload: UploadFile[]) => {
    console.log("file uploaded started")
    // Fetch signature from backend
    // const signatureRes = await fetch('https://vibein-2hk5.onrender.com/storage/signed-url')
    // const { timestamp, signature, public_id, eager_async } = await signatureRes.json()

    await Promise.all(
      filesToUpload.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', '861997738819367')
        formData.append('timestamp', file.signedInfo?.timestamp.toString())
        formData.append('signature', file.signedInfo?.signature)
        formData.append('public_id', file.signedInfo?.public_id)
        formData.append('folder', 'production_assets/profiles')
        formData.append('tags', 'user_profile,website_v2')
        formData.append('context', 'author=ahad|category=avatar|env=prod')
        formData.append('overwrite', 'false')
        formData.append('access_mode', 'public')
        formData.append('unique_filename', 'true')
        formData.append('use_filename', 'false')
        formData.append('transformation', 'c_limit,w_1000/q_auto,f_auto')
        formData.append('eager_async', 'true');

        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/dnyr37sgw/auto/upload`)

        // Track progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total)
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, progress: percent } : f
              )
            )
          }
        }

        xhr.onload = () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: 'done', progress: 100 } : f
            )
          )
        }

        xhr.onerror = () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: 'error' } : f
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
      <button onClick={()=> uploadFiles(files)} className='text-white p-2 m-2 rounded'> send </button>

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


// File {handle: FileSystemFileHandle, path: './Screenshot (39).png', relativePath: './Screenshot (39).png', name: 'Screenshot (39).png', lastModified: 1725026434000, …}
// handle
// : 
// FileSystemFileHandle {kind: 'file', name: 'Screenshot (39).png'}
// path
// : 
// "./Screenshot (39).png"
// relativePath
// : 
// "./Screenshot (39).png"
// lastModified
// : 
// 1725026434000
// lastModifiedDate
// : 
// Fri Aug 30 2024 20:00:34 GMT+0600 (Bangladesh Standard Time) {}
// name
// : 
// "Screenshot (39).png"
// size
// : 
// 226673
// type
// : 
// "image/png"