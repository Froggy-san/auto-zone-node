import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ImageUp, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@//components/ui/tooltip"
import React, {
  useCallback,
  useEffect,
  useMemo,
  type SetStateAction,
} from "react"
import {
  useDropzone,
  type FileRejection,
  type FileWithPath,
} from "react-dropzone"
import ProgressBar from "@/components/progress-bar"
import {
  Progress,
  ProgressBarContainer,
  ProgressMeter,
} from "@/components/progress"
import { byteSize } from "@/lib/constants"
import type { ProductImage } from "@/types"
import type { FileWithPreview } from "@/lib/types"
const BASE_URL = import.meta.env.VITE_API_URL

interface MultiFileUploaderProps {
  mainImageName: string
  setMainImageName: React.Dispatch<SetStateAction<string>>
  fieldChange: React.Dispatch<SetStateAction<File[]>>
  selectedFiles: FileWithPreview[]
  mediaUrl?: ProductImage[]
  disabled?: boolean
  handleDeleteMedia: (image: ProductImage) => void
}

export function MultiFileUploader({
  mainImageName,
  setMainImageName,
  selectedFiles,
  fieldChange,
  handleDeleteMedia,
  disabled,
  mediaUrl,
}: MultiFileUploaderProps) {
  const totalFileSizesMB = useMemo(() => {
    const totalSize = selectedFiles.reduce((acc, curr) => {
      acc += curr.size

      return acc
    }, 0)

    // To convert the total size of the image files to megabytes, you'll need to divide the total size (which is usually in bytes) by 1,048,576 (since 1 megabyte is  1,048,576bytes).
    return totalSize / byteSize
  }, [selectedFiles])

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      const addedImages = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      )

      fieldChange([...selectedFiles, ...addedImages])
    },
    [fieldChange, selectedFiles]
  )

  // Handle deletion of selected images
  function handleDeleteSelectedImages(viewedFile: FileWithPreview) {
    URL.revokeObjectURL(viewedFile.preview) // Revoke the URL of the deleted file
    const newArr = selectedFiles.filter((file) => file !== viewedFile)
    fieldChange(newArr)
  }

  // Cleanup object URLs on component unmount
  // useEffect(() => {
  //   return () => {
  //     selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  //   };
  // }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled,
    accept: { "image/*": [], "video/*": [] },
  })

  return (
    <>
      <div
        {...getRootProps({
          className:
            "flex justify-center items-center    min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        })}
      >
        <input {...getInputProps()} />

        {selectedFiles.length || mediaUrl?.length ? (
          <ul
            className={cn(
              "flex max-h-[500px] w-full flex-col gap-5 overflow-y-auto px-4 sm:flex-row sm:flex-wrap sm:px-0",
              {
                "opacity-55": isDragActive,
              }
            )}
          >
            {mediaUrl?.map((media, i) => (
              <li
                onClick={(e) => e.stopPropagation()}
                key={i}
                className="relative flex items-center justify-center"
              >
                <Button
                  disabled={disabled}
                  type="button"
                  onClick={() => {
                    if (mainImageName === media.filename) setMainImageName("")
                    handleDeleteMedia(media)
                  }}
                  aria-label={`the remove button for the image number ${
                    i + 1
                  } and with the name of ${media}}`}
                  className="absolute top-0 right-0 z-10 h-5 w-5 p-0"
                >
                  <X size={15} />
                </Button>
                {media.imageUrl.includes("mp4") ? (
                  <video
                    key={media._id}
                    src={`${BASE_URL}${media.imageUrl}`}
                    className="max-h-[250px] sm:max-h-[120px]"
                  >
                    <source src={`${BASE_URL}${media.imageUrl}`} />
                  </video>
                ) : (
                  <img
                    src={`${BASE_URL}${media.imageUrl}`}
                    alt="Image selected"
                    className="max-h-[250px] sm:max-h-[120px]"
                  />
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        disabled={disabled}
                        checked={
                          (mainImageName && mainImageName === media.filename) ||
                          false
                        }
                        onClick={() => {
                          if (mainImageName === media.filename)
                            setMainImageName("")
                          else setMainImageName(media.filename)
                        }}
                        className={`absolute bottom-1 left-1 ${
                          mainImageName &&
                          mainImageName === media.filename &&
                          "bg-primary"
                        } `}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set as main image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}

            {selectedFiles.map((file, i) => (
              <li
                onClick={(e) => e.stopPropagation()}
                key={i}
                className="relative flex items-center justify-center"
              >
                <Button
                  disabled={disabled}
                  type="button"
                  onClick={() => {
                    if (mainImageName === file.name) setMainImageName("")
                    handleDeleteSelectedImages(file)
                  }}
                  aria-label={`the remove button for the image number ${
                    i + 1
                  } and with the name of ${file.name}`}
                  className="absolute top-0 right-0 z-10 h-5 w-5 p-0"
                >
                  <X size={15} />
                </Button>
                {file.type.startsWith("video/") ? (
                  <video
                    key={i}
                    src={file.preview}
                    className="media-file max-h-[250px] sm:max-h-[120px]"
                  >
                    <source src={file.preview} type={file.type} />
                  </video>
                ) : (
                  <img
                    src={file.preview}
                    alt="Image selected"
                    className="max-h-[250px] sm:max-h-[120px]"
                  />
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        disabled={disabled}
                        checked={mainImageName === file.name}
                        onClick={() => {
                          if (mainImageName === file.name) setMainImageName("")
                          else setMainImageName(file.name)
                        }}
                        className={`${
                          mainImageName === file.name && "bg-primary"
                        } absolute bottom-1 left-1`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set as main image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* <Checkbox
                disabled={disabled}
                checked={typeof mainImageName === "number" && mainImageName === i}
                onClick={() => {
                  if (mainImageName === i) setMainImageName(null);
                  else setMainImageName(i);
                }}
                className=" absolute left-1 bottom-1 "
              /> */}
              </li>
            ))}
          </ul>
        ) : null}
        {!mediaUrl?.length && !selectedFiles.length && (
          <div className="text-center">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <ImageUp size={40} />
                <p className="hidden sm:block">
                  {" "}
                  Drag &apos;n&apos; drop some files here, or click to select
                  files
                </p>
                <p className="sm:hidden">
                  {" "}
                  touch to upload files here, or click to select files
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {/* <progress value={70} max={100}></progress> */}
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <h3>Size</h3> <p>{totalFileSizesMB.toFixed(2)} MB</p>
        </div>
        {/* <ProgressBar value={totalFileSizesMB} maxValue={4} /> */}
        <Progress value={totalFileSizesMB} maxValue={4}>
          <ProgressBarContainer>
            <ProgressMeter
              className={`bg-green-600 ${
                totalFileSizesMB < 3.5 &&
                totalFileSizesMB > 3 &&
                "bg-yellow-600"
              } ${totalFileSizesMB > 3.5 && "bg-red-600"}`}
            />
          </ProgressBarContainer>
        </Progress>
        <AnimatePresence>
          {totalFileSizesMB > 4 && (
            <motion.p
              initial={{ opacity: 0, display: "none" }}
              animate={{ opacity: 1, display: "block" }}
              exit={{
                opacity: 0,
                display: "hidden",
              }}
              transition={{
                duration: 1,
                type: "tween",
              }}
              className={cn(
                `mt-1 hidden text-center text-xs text-destructive`
                // { " opacity-100 block ": totalFileSizesMB > 4 }
              )}
            >
              Might face problems while uploading the images.
            </motion.p>
          )}
        </AnimatePresence>

        {/* <div
          className={cn(
            `relative w-full overflow-hidden h-2 rounded-full border `
          )}
        >
          <div
            className={cn(
              ` absolute  top-0 w-full h-full bg-red-600 rounded-full transition-all `,
              {
                " bg-green-600": totalFileSizesMB < 3,
              }
            )}
            style={{
              left: `${progressPercentage - 100}%`,
            }}
          />
        </div> */}
      </div>
    </>
  )
}
