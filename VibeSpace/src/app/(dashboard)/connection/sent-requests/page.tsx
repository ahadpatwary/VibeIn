"use client"
import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [text, setText] = useState("Hello World")
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const onFileChange = (e: any) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const generateImage = async () => {
    const img = new Image()
    img.src = image!

    await new Promise((resolve) => (img.onload = resolve))

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    const { width, height, x, y } = croppedAreaPixels

    canvas.width = width
    canvas.height = height

    ctx.filter = `brightness(${brightness}%)`
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-width / 2, -height / 2)

    ctx.drawImage(
      img,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    )

    // Add Text
    ctx.font = "30px sans-serif"
    ctx.fillStyle = "white"
    ctx.fillText(text, 20, 40)

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg")
    })
  }

  const handleExport = async () => {
    const blob = await generateImage()
    console.log("Edited Blob:", blob)
  }

  return (
    <div className="p-6 text-white bg-black min-h-screen space-y-4">
      <input type="file" onChange={onFileChange} />

      {image && (
        <div className="relative w-full h-96 bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          Zoom
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div>
          Rotation
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
        </div>

        <div>
          Brightness
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </div>

        <div>
          Text
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-black"
          />
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Export Image
        </button>
      </div>
    </div>
  )
}