import { cn } from "@lib/utils";
import { ImageUp } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";

interface FileUploaderProps {
  fieldChange: (FILES: File[]) => void;
  mediaUrl?: string;
  className?: string;
  imageStyle?: string;

  externalImg?: { index: number; image: string };
  setExternalImgState?: React.Dispatch<
    React.SetStateAction<{ index: number; image: string }[]>
  >;
}

export function FileUploader({
  fieldChange,
  mediaUrl,
  className,
  imageStyle,
  externalImg,
  setExternalImgState,
}: FileUploaderProps) {
  const [viewedImage, setViewedImage] = useState(mediaUrl || "");

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      const imageBlob = URL.createObjectURL(acceptedFiles[0]);
      if (externalImg !== undefined && setExternalImgState !== undefined) {
        setExternalImgState((prevArr) => {
          return prevArr.map((image) => {
            if (image.index === externalImg.index) {
              URL.revokeObjectURL(image.image);
              return { index: image.index, image: imageBlob };
            } else {
              return image;
            }
          });
        });
      } else {
        setViewedImage(imageBlob);
      }
      fieldChange(acceptedFiles);

      // Do something with the files
    },
    [setExternalImgState, setViewedImage, fieldChange]
  );
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(viewedImage);
    };
  }, [viewedImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps({
        className: cn(
          " flex justify-center items-center  min-h-[140px]    w-full rounded-md border border-input bg-background px-3 py-2 text-sm   ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className
        ),
      })}
    >
      <input {...getInputProps()} />

      {(viewedImage || externalImg?.image) && (
        <div
          className={cn(
            " flex flex-col w-full h-full justify-center items-center ",
            {
              " opacity-55": isDragActive,
            }
          )}
        >
          <img
            src={externalImg?.image || viewedImage}
            alt="Selected image"
            className={cn("object-cover  max-h-[500px] rounded-lg", imageStyle)}
          />
          <p className=" text-muted-foreground   text-center  my-3">
            Drag or click to replace.
          </p>
        </div>
      )}
      {!viewedImage && !externalImg?.image && (
        <div>
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <div className=" flex items-center justify-center gap-3 flex-col">
              <ImageUp size={40} />
              Drag &apos;n&apos; drop some files here`&#39; or click to select
              files{" "}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
