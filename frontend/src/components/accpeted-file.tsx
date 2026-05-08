import React, { useEffect } from "react"
import CloseButton from "./close-button"
import { Button } from "./ui/button"
import { formatBytes } from "@lib/client-helpers"
import { File, FileAudio } from "lucide-react"
import { cn } from "@lib/utils"
import { useAnimate, usePresence, motion } from "framer-motion"

interface Props {
  // file: FileWithPreview;
  isUploaded?: boolean
  isSetToBeDeleted?: boolean
  fileUrl: string
  fileType: string
  fileName: string
  fileSize?: number
  handleRemove: () => void
  className?: string
  index: number
}

export const AcceptedFile = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      isSetToBeDeleted = false,
      isUploaded = false,
      fileName,
      fileSize,
      fileType,
      fileUrl,
      handleRemove,
      className,
      index,
    },
    ref
  ) => {
    const [isPresent, safeToRemove] = usePresence()
    const [scope, animate] = useAnimate()

    useEffect(() => {
      if (!isPresent) {
        const exitAnimation = async () => {
          await animate(
            scope.current,

            { scale: 1.025 },
            { ease: "easeIn", duration: 0.125 }
          )

          await animate(
            scope.current,
            {
              opacity: 0,
              x: index % 2 === 0 ? 24 : -24,
            },
            {
              delay: 0.75,
            }
          )
          safeToRemove()
        }

        exitAnimation()
      }
    }, [isPresent])
    return (
      <motion.div
        layout
        ref={scope}
        className={cn(
          "relative flex w-full max-w-full items-center gap-x-4 border-b py-2 first:mt-4",
          // last:mb-4
          className
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
          {fileType?.startsWith("image/") ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="object-cover"
              // onLoad={() => URL.revokeObjectURL(file.preview)}
            />
          ) : fileType?.startsWith("video/") || fileType.endsWith(".mp4") ? (
            <video src={fileUrl} className="object-contian h-full">
              <source
                src={fileUrl}
                type={fileType}
                onLoad={() => URL.revokeObjectURL(fileUrl)}
              />
            </video>
          ) : fileType?.startsWith("audio/") || fileType.endsWith(".mp3") ? (
            <FileAudio className="h-4 w-4" />
          ) : (
            <File className="h-4 w-4" />
          )}
        </div>
        <div className="relative flex flex-col items-start">
          {" "}
          <p
            title={fileName}
            className="line-clamp-1 w-full max-w-full text-sm break-all"
          >
            {fileName}
          </p>
          {fileSize && (
            <p className="text-xs text-muted-foreground">
              {formatBytes(fileSize, 2)}
            </p>
          )}
          {isUploaded && (
            <p className="text-xs text-muted-foreground">Uploaded</p>
          )}
        </div>
        {isSetToBeDeleted ? (
          <Button
            onClick={handleRemove}
            variant="secondary"
            className="ml-auto h-fit px-2 py-1 text-xs"
          >
            Undo
          </Button>
        ) : (
          <CloseButton
            className="static ml-auto"
            onClick={(e) => {
              handleRemove()
            }}
          />
        )}
      </motion.div>
    )
  }
)
AcceptedFile.displayName = "AcceptedFile"
