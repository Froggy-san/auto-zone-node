import { Button } from "@components/ui/button";
import { CarImage, FileWithPreview, ProductImage } from "@lib/types";
import { cn } from "@lib/utils";
import { ImageUp, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { SetStateAction, useCallback, useEffect, useMemo } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import ProgressBar from "@components/progress-bar";

interface MultiFileUploaderProps {
  fieldChange: React.Dispatch<SetStateAction<File[]>>;
  selectedFiles: FileWithPreview[];
  mediaUrl?: CarImage[];
  disabled?: boolean;
  handleDeleteMedia: (image: CarImage) => void;
}

const byteSize = 1048576;

export function GarageFileUploader({
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
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled,
    accept: { "image/*": [] },
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
              <li key={i} className="relative flex justify-center items-center">
                <Button
                  disabled={disabled}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMedia(media);
                    // handleDeleteSelectedImages(file);
                  }}
                  aria-label={`the remove button for the image number ${
                    i + 1
                  } and with the name of ${media}}`}
                  className="absolute right-0 top-0 z-10 h-5 w-5 p-0"
                >
                  <X size={15} />
                </Button>
                <img
                  src={media.imagePath}
                  alt="Image selected"
                  className=" max-h-[250px] sm:max-h-[120px]"
                />
              </li>
            ))}

            {selectedFiles.map((file, i) => (
              <li key={i} className="relative flex justify-center items-center">
                <Button
                  disabled={disabled}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSelectedImages(file);
                  }}
                  aria-label={`the remove button for the image number ${
                    i + 1
                  } and with the name of ${file.name}`}
                  className="absolute right-0 top-0 z-10 h-5 w-5 p-0"
                >
                  <X size={15} />
                </Button>
                <img
                  src={file.preview}
                  alt="Image selected"
                  className="max-h-[250px] sm:max-h-[120px]"
                />
              </li>
            ))}
          </ul>
        ) : null}
        {!mediaUrl?.length && !selectedFiles.length && (
          <div>
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
        <ProgressBar value={totalFileSizesMB} maxValue={4} />

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
