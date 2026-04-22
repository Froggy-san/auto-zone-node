import { formatBytes } from "@lib/client-helpers";
import { RejecetedFile } from "@lib/types";
import { cn } from "@lib/utils";
import { File, FileAudio } from "lucide-react";
import CloseButton from "./close-button";
import React, { useEffect } from "react";
import { useAnimate, usePresence, motion } from "framer-motion";
const MAX_SIZE = 1000000;
const MAX_FILES = 10;

interface Props {
  rejectedFile: RejecetedFile;
  handleRemove: () => void;
  className?: string;
  index: number;
}

export const RejecetdFile = React.forwardRef<HTMLDivElement, Props>(
  ({ rejectedFile, handleRemove, className, index }, ref) => {
    const file = rejectedFile.file;

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
        ref={scope}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4 ",
          className
        )}
      >
        <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
          <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
            {file.type?.startsWith("image/") ? (
              <img
                src={rejectedFile.file.preview}
                alt={file.name}
                className="object-cover"
              />
            ) : file.type?.startsWith("video/") ? (
              <video
                src={rejectedFile.file.preview}
                className="object-contian  h-full "
              >
                <source src={rejectedFile.file.preview} type={file.type} />
              </video>
            ) : file.type?.startsWith("audio/") ? (
              <FileAudio className=" w-4 h-4" />
            ) : (
              <File className=" w-4 h-4" />
            )}
          </div>
        </div>
        <div className="shrink grow flex flex-col items-start ">
          {" "}
          <p
            title={rejectedFile.file.name}
            className="text-sm w-full break-all max-w-full  line-clamp-1 "
          >
            {rejectedFile.file.name}
          </p>
          <p className="text-xs text-destructive">
            {rejectedFile.errors[0].message.startsWith("File is larger than")
              ? `File is larger than ${formatBytes(
                  MAX_SIZE,
                  2
                )} (Size: ${formatBytes(rejectedFile.file.size, 2)})`
              : rejectedFile.errors[0].message}
          </p>
        </div>
        <CloseButton onClick={handleRemove} className=" static" />
      </motion.div>
    );
  }
);

RejecetdFile.displayName = "RejectedFile";
