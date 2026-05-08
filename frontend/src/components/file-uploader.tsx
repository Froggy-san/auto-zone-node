import { cn } from "@lib/utils"
import { ImageUp } from "lucide-react"
import React, { useCallback, useEffect, useState } from "react"
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone"

interface FileUploaderProps {
  fieldChange: (FILES: File[]) => void
  mediaUrl?: string
  className?: string
  imageStyle?: string

  externalImg?: { index: number; image: string }
  setExternalImgState?: React.Dispatch<
    React.SetStateAction<{ index: number; image: string }[]>
  >
}

export function FileUploader({
  fieldChange,
  mediaUrl,
  className,
  imageStyle,
  externalImg,
  setExternalImgState,
}: FileUploaderProps) {
  const [viewedImage, setViewedImage] = useState(mediaUrl || "")

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      const imageBlob = URL.createObjectURL(acceptedFiles[0])
      if (externalImg !== undefined && setExternalImgState !== undefined) {
        setExternalImgState((prevArr) => {
          return prevArr.map((image) => {
            if (image.index === externalImg.index) {
              URL.revokeObjectURL(image.image)
              return { index: image.index, image: imageBlob }
            } else {
              return image
            }
          })
        })
      } else {
        setViewedImage(imageBlob)
      }
      fieldChange(acceptedFiles)

      // Do something with the files
    },
    [setExternalImgState, setViewedImage, fieldChange]
  )
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(viewedImage)
    }
  }, [viewedImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div
      {...getRootProps({
        className: cn(
          "flex min-h-[140px] w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
      })}
    >
      <input {...getInputProps()} />

      {(viewedImage || externalImg?.image) && (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center",
            {
              "opacity-55": isDragActive,
            }
          )}
        >
          <img
            src={externalImg?.image || viewedImage}
            alt="Selected image"
            className={cn("max-h-[500px] rounded-lg object-cover", imageStyle)}
          />
          <p className="my-3 text-center text-muted-foreground">
            Drag or click to replace.
          </p>
        </div>
      )}
      {!viewedImage && !externalImg?.image && (
        <div>
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <ImageUp size={40} />
              Drag &apos;n&apos; drop some files here`&#39; or click to select
              files{" "}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
