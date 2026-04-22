import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { FileWithPreview, ProductImage } from "@lib/types";
import { cn } from "@lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ImageUp, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { SetStateAction, useCallback, useEffect, useMemo } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import ProgressBar from "@components/progress-bar";
import {
  Progress,
  ProgressBarContainer,
  ProgressMeter,
} from "@components/progress";
import { byteSize } from "@lib/constants";

interface MultiFileUploaderProps {
  isMainImage: ProductImage | number | null;
  setIsMainImage: React.Dispatch<SetStateAction<ProductImage | number | null>>;
  fieldChange: React.Dispatch<SetStateAction<File[]>>;
  selectedFiles: FileWithPreview[];
  mediaUrl?: ProductImage[];
  disabled?: boolean;
  handleDeleteMedia: (image: ProductImage) => void;
}

export function MultiFileUploader({
  isMainImage,
  setIsMainImage,
  selectedFiles,
  fieldChange,
  handleDeleteMedia,
  disabled,
  mediaUrl,
}: MultiFileUploaderProps) {
  const totalFileSizesMB = useMemo(() => {
    const totalSize = selectedFiles.reduce((acc, curr) => {
      acc += curr.size;

      return acc;
    }, 0);

    // To convert the total size of the image files to megabytes, you'll need to divide the total size (which is usually in bytes) by 1,048,576 (since 1 megabyte is  1,048,576bytes).
    return totalSize / byteSize;
  }, [selectedFiles]);

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      const addedImages = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );

      fieldChange([...selectedFiles, ...addedImages]);
    },
    [fieldChange, selectedFiles]
  );

  // Handle deletion of selected images
  function handleDeleteSelectedImages(viewedFile: FileWithPreview) {
    URL.revokeObjectURL(viewedFile.preview); // Revoke the URL of the deleted file
    const newArr = selectedFiles.filter((file) => file !== viewedFile);
    fieldChange(newArr);
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
  });

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
              "flex flex-col sm:flex-row   sm:flex-wrap  max-h-[500px] w-full  overflow-y-auto  px-4 sm:px-0   gap-5",
              {
                "opacity-55": isDragActive,
              }
            )}
          >
            {mediaUrl?.map((media, i) => (
              <li
                onClick={(e) => e.stopPropagation()}
                key={i}
                className="relative flex justify-center items-center"
              >
                <Button
                  disabled={disabled}
                  type="button"
                  onClick={() => {
                    if (isMainImage === media) setIsMainImage(null);
                    handleDeleteMedia(media);
                  }}
                  aria-label={`the remove button for the image number ${
                    i + 1
                  } and with the name of ${media}}`}
                  className="absolute right-0 top-0 z-10 h-5 w-5 p-0"
                >
                  <X size={15} />
                </Button>
                {media.imageUrl.includes("mp4") ? (
                  <video
                    key={media.id}
                    src={media.imageUrl}
                    className=" max-h-[250px] sm:max-h-[120px]"
                  >
                    <source src={media.imageUrl} />
                  </video>
                ) : (
                  <img
                    src={media.imageUrl}
                    alt="Image selected"
                    className=" max-h-[250px] sm:max-h-[120px]"
                  />
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        disabled={disabled}
                        checked={
                          (typeof isMainImage !== "number" &&
                            isMainImage &&
                            isMainImage.id === media.id) ||
                          false
                        }
                        onClick={() => {
                          if (isMainImage === media) setIsMainImage(null);
                          else setIsMainImage(media);
                        }}
                        className={` absolute left-1 bottom-1 ${
                          typeof isMainImage !== "number" &&
                          isMainImage &&
                          isMainImage.id === media.id &&
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
                className="relative flex justify-center items-center"
              >
                <Button
                  disabled={disabled}
                  type="button"
                  onClick={() => {
                    if (isMainImage === i) setIsMainImage(null);
                    handleDeleteSelectedImages(file);
                  }}
                  aria-label={`the remove button for the image number ${
                    i + 1
                  } and with the name of ${file.name}`}
                  className="absolute right-0 top-0 z-10 h-5 w-5 p-0"
                >
                  <X size={15} />
                </Button>
                {file.type.startsWith("video/") ? (
                  <video
                    key={i}
                    src={file.preview}
                    className="media-file      max-h-[250px] sm:max-h-[120px]"
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
                        checked={
                          typeof isMainImage === "number" && isMainImage === i
                        }
                        onClick={() => {
                          if (isMainImage === i) setIsMainImage(null);
                          else setIsMainImage(i);
                        }}
                        className={`${
                          typeof isMainImage === "number" &&
                          isMainImage === i &&
                          "bg-primary"
                        } absolute left-1 bottom-1`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set as main image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* <Checkbox
                disabled={disabled}
                checked={typeof isMainImage === "number" && isMainImage === i}
                onClick={() => {
                  if (isMainImage === i) setIsMainImage(null);
                  else setIsMainImage(i);
                }}
                className=" absolute left-1 bottom-1 "
              /> */}
              </li>
            ))}
          </ul>
        ) : null}
        {!mediaUrl?.length && !selectedFiles.length && (
          <div className=" text-center">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <div className="flex items-center justify-center gap-3 flex-col">
                <ImageUp size={40} />
                <p className=" hidden sm:block">
                  {" "}
                  Drag &apos;n&apos; drop some files here, or click to select
                  files
                </p>
                <p className="  sm:hidden">
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
        <div className="  font-semibold text-xs text-muted-foreground flex items-center justify-between">
          <h3>Size</h3> <p>{totalFileSizesMB.toFixed(2)} MB</p>
        </div>
        {/* <ProgressBar value={totalFileSizesMB} maxValue={4} /> */}
        <Progress value={totalFileSizesMB} maxValue={4}>
          <ProgressBarContainer>
            <ProgressMeter
              className={` bg-green-600  ${
                totalFileSizesMB < 3.5 &&
                totalFileSizesMB > 3 &&
                "bg-yellow-600"
              }  ${totalFileSizesMB > 3.5 && "bg-red-600"}`}
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
                `text-center mt-1 hidden text-destructive text-xs   `
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
  );
}
