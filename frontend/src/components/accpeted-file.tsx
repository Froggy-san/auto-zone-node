import React, { useEffect } from "react";
import CloseButton from "./close-button";
import { Button } from "./ui/button";
import { formatBytes } from "@lib/client-helpers";
import { File, FileAudio } from "lucide-react";
import { cn } from "@lib/utils";
import { useAnimate, usePresence, motion } from "framer-motion";

interface Props {
  // file: FileWithPreview;
  isUploaded?: boolean;
  isSetToBeDeleted?: boolean;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize?: number;
  handleRemove: () => void;
  className?: string;
  index: number;
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
    const [isPresent, safeToRemove] = usePresence();
    const [scope, animate] = useAnimate();

    useEffect(() => {
      if (!isPresent) {
        const exitAnimation = async () => {
          await animate(
            scope.current,

            { scale: 1.025 },
            { ease: "easeIn", duration: 0.125 }
          );

          await animate(
            scope.current,
            {
              opacity: 0,
              x: index % 2 === 0 ? 24 : -24,
            },
            {
              delay: 0.75,
            }
          );
          safeToRemove();
        };

        exitAnimation();
      }
    }, [isPresent]);
    return (
      <motion.div
        layout
        ref={scope}
        className={cn(
          "flex w-full max-w-full items-center gap-x-4 border-b py-2 first:mt-4   relative ",
          // last:mb-4
          className
        )}
      >
        <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
          {fileType?.startsWith("image/") ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="object-cover"
              // onLoad={() => URL.revokeObjectURL(file.preview)}
            />
          ) : fileType?.startsWith("video/") || fileType.endsWith(".mp4") ? (
            <video src={fileUrl} className="object-contian  h-full ">
              <source
                src={fileUrl}
                type={fileType}
                onLoad={() => URL.revokeObjectURL(fileUrl)}
              />
            </video>
          ) : fileType?.startsWith("audio/") || fileType.endsWith(".mp3") ? (
            <FileAudio className=" w-4 h-4" />
          ) : (
            <File className=" w-4 h-4" />
          )}
        </div>
        <div className=" flex flex-col items-start relative   ">
          {" "}
          <p
            title={fileName}
            className="text-sm w-full break-all max-w-full  line-clamp-1 "
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
            className=" h-fit ml-auto py-1 px-2 text-xs"
          >
            Undo
          </Button>
        ) : (
          <CloseButton
            className=" static ml-auto"
            onClick={(e) => {
              handleRemove();
            }}
          />
        )}
      </motion.div>
    );
  }
);
AcceptedFile.displayName = "AcceptedFile";
