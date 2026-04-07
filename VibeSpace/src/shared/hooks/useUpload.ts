'use client'
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone/."

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

export const useUpload = () => {

  const [files, setFiles] = useState<UploadFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {

    const signatureRes = await fetch(`https://vibein-2hk5.onrender.com/storage/signed-url?count=${acceptedFiles.length}`);

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


  return { files, uploadFiles, getRootProps, getInputProps, isDragActive }
  
}