import { Button } from "@components/ui/button";
import { LucideImageMinus, Minus, Plus } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  usePresence,
} from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClickAwayListener, useMediaQuery } from "@mui/material";
import { Cross2Icon } from "@radix-ui/react-icons";
import { FileRejection } from "react-dropzone";
import { url } from "inspector";
import { RejectionFiles } from "@lib/types";
import { byteSize, maxSize } from "@lib/constants";
import CloseButton from "@components/close-button";

// how to generate random ids.
// crypto.randomUUID()
function RejectedFiles({
  rejectedFiles,
  setRejected,
}: {
  rejectedFiles: RejectionFiles[];
  setRejected: React.Dispatch<React.SetStateAction<RejectionFiles[]>>;
}) {
  const [open, setOpen] = useState(false);
  const isBigScreen = useMediaQuery("(min-width:640px)");

  const clearRejected = () => {
    rejectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    setRejected([]);
  };

  const handleDelRejected = useCallback(
    (index: number) => {
      const item = rejectedFiles[index];
      URL.revokeObjectURL(item.preview);
      const newArr = rejectedFiles.toSpliced(index, 1);
      setRejected(newArr);
    },
    [rejectedFiles, setRejected]
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <section className="  mx-auto w-fit  mt-10">
        <div className="relative inline">
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                key="rejected-files-popup"
                initial={{
                  width: 150,
                  // height: 250,
                  opacity: 0,
                  y: 50, // Start a bit lower for a slide-up effect
                }}
                animate={{
                  width: rejectedFiles.length
                    ? isBigScreen
                      ? 450
                      : 300
                    : isBigScreen
                    ? 350
                    : 300,
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 300, damping: 15 },
                }}
                exit={{
                  width: 150,
                  // height: 250,
                  opacity: 0,
                  y: 50,
                  transition: { duration: 0.2 },
                }}
                className="bg-card border  absolute bottom-[30px] mb-2 left-1/2 !transform -translate-x-1/2 p-3 rounded-xl shadow-lg "
                // Positioned the popup above the button
              >
                <div className=" flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2 ">
                    Rejected Files
                  </h3>
                  <CloseButton onClick={() => setOpen(false)} />
                </div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -100,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: -50,
                    transition: { duration: 0.2 },
                  }}
                  className=" max-h-72 overflow-y-auto p-1 overflow-x-hidden   space-y-1 "
                >
                  <AnimatePresence mode="sync">
                    {rejectedFiles.length ? (
                      rejectedFiles.map((file, i) => (
                        <Item
                          key={file.file.name}
                          rejected={file}
                          handleDelRejected={() => handleDelRejected(i)}
                        />
                      ))
                    ) : (
                      <div className=" flex flex-col  items-center justify-center gap-y-2 h-20  bg-muted-foreground/10  dark:bg-accent/50 rounded-xl">
                        <p className=" text-sm font-semibold text-muted-foreground">
                          No rejected files.
                        </p>
                        <LucideImageMinus size={35} />
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
                {/* Add more items or map over an array of rejected files */}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            key={`button-key-${open}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1, 0.5, 1] }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            className="inline-flex relative items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs gap-1"
            onClick={() => setOpen((prevOpen) => !prevOpen)}
          >
            <AnimatePresence>
              {!open && (
                <motion.span
                  key={`rejected-count-${rejectedFiles.length}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1, 0.5, 1] }}
                  transition={{ type: "spring", stiffness: 300, damping: 7 }}
                  className=" rounded-full  w-4 h-4 flex items-center justify-center text-muted-foreground bg-secondary absolute -right-3  -top-5"
                >
                  {rejectedFiles.length}
                </motion.span>
              )}
            </AnimatePresence>
            {open ? (
              <motion.span
                initial={{
                  opacity: 0,
                }}
                animate={{ opacity: 1 }}
              >
                <Minus size={19} />
              </motion.span>
            ) : (
              <motion.span
                initial={{
                  opacity: 0,
                }}
                animate={{ opacity: 1 }}
              >
                <Plus size={19} />
              </motion.span>
            )}{" "}
            Rejected Files
          </motion.button>
        </div>
      </section>
    </ClickAwayListener>
  );
}

export default RejectedFiles;

interface ItemProps {
  rejected: RejectionFiles;
  handleDelRejected: () => void;
}
const image =
  "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg";

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ rejected, handleDelRejected }, ref) => {
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
              y: 24,
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

    const type = rejected.file.type.split("/")[0];
    return (
      <motion.div
        layout
        ref={scope}
        className=" rounded-xl   relative bg-muted-foreground/10  dark:bg-accent/50  overflow-hidden    transition-all  hover:scale-[97%] max-h-28  hover:bg-muted-foreground/20 dark:hover:bg-accent/25  flex  item  "
      >
        <CloseButton onClick={handleDelRejected} className=" top-2  right-1" />
        {type === "video" ? (
          <video
            autoPlay
            controls={false}
            src={rejected.preview}
            className=" w-[40%] object-cover object-top h-full"
          />
        ) : (
          <img
            src={rejected.preview}
            className=" w-[40%] object-cover object-top h-full"
          />
        )}

        <div className=" p-1 pl-2 space-y-2">
          <p className="  font-semibold line-clamp-2 pr-2 max-w-full ">
            {rejected.file.name}.
          </p>
          <p className=" text-xs text-red-600">
            {`File is larger than ${Math.round(maxSize / byteSize)}MB`}.
          </p>
        </div>
      </motion.div>
    );
  }
);

Item.displayName = "item";
// Get the target DOM node for the portal
// This line will run every time the component re-renders.
// If "settings-page" might not be in the DOM initially, consider useEffect or other strategies.
// const mainPage = document.getElementById("settings-page");

// CRITICAL FIX: If mainPage is not found, return a fallback UI or null
// This prevents createPortal from being called with a null container.
// if (!mainPage) {
//   console.warn(
//     "Portal target element with ID 'settings-page' not found in the DOM."
//   );
//   // You can return null or some fallback UI.
//   // Returning null means the component renders nothing.
//   // Returning a <p> tag means it renders that message in its current place in the React tree (not portaled).
//   return (
//     <p className="text-red-500 p-4">
//       Error: Portal target 'settings-page' not found. Cannot display rejected
//       files.
//     </p>
//   );
// }

// If mainPage IS found, then we can safely create the portal.
// The component will now render its content into the 'mainPage' DOM element.
