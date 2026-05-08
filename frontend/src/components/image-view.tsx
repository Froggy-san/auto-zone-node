import { useEffect } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { ClickAwayListener, Portal } from "@mui/material"

const ImageView = ({
  handleClose,
  image,
}: {
  image: string | null
  handleClose: () => void
}) => {
  // Define a function to reset the body styles
  const resetBodyStyle = () => {
    const body = document.querySelector("body")
    if (body) {
      body.style.height = "unset"
      body.style.overflow = "unset"
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const body = document.querySelector("body")

      if (!body) return

      // Set the style when the image is open
      if (typeof image === "string" && body) {
        body.style.height = "100vh"
        body.style.overflow = "hidden"
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault() // Prevent default browser behavior
          handleClose()
        }
      }

      // Add event listener for browser navigation
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("popstate", resetBodyStyle)

      // Clean up the event listener and reset styles when the component unmounts or image changes
      return () => {
        window.removeEventListener("popstate", resetBodyStyle)
        window.removeEventListener("keydown", handleKeyDown)
        resetBodyStyle() // Reset styles on unmount or image change
      }
    }
  }, [image, handleClose])

  return (
    <>
      <Portal>
        <AnimatePresence>
          {image ? (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, type: "spring" }}
              key="container"
              className="fixed top-0 left-0 z-[99999] flex h-[100dvh] w-full items-center justify-center bg-[rgba(0,0,0,0.3)] backdrop-blur-sm backdrop-brightness-50 select-none"
            >
              <Button
                variant="secondary"
                className="absolute top-10 right-5 z-[99999] h-7 w-7 rounded-full bg-muted p-0"
                onClick={handleClose} // Ensure this button calls the handleClose function
              >
                <X size={20} />
              </Button>
              <ClickAwayListener
                mouseEvent="onMouseUp"
                touchEvent="onTouchEnd"
                onClickAway={(e) => {
                  e.preventDefault()
                  handleClose()
                }}
              >
                <motion.img
                  src={image}
                  key="image"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  alt="Enlarged view"
                  className="max-h-[90%] max-w-[100%] object-contain sm:max-h-[100%]"
                />
              </ClickAwayListener>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  )
}

export default ImageView

// import { useEffect } from "react";
// import { ClickAwayListener } from "@mui/base";
// import { Button } from "../ui/button";
// import { IoIosClose } from "react-icons/io";

// const ImageView = ({
//   handleClose,
//   image,
// }: {
//   image: string | null;
//   handleClose: () => void;
// }) => {
//   useEffect(() => {
//     const body = document.querySelector("body");
//     const resetBodyStyle = () => {
//       if (body) {
//         body.style.height = "unset";
//         body.style.overflow = "unset";
//       }
//     };

//     // Set the style when the image is open
//     if (typeof image === "string") {
//       if (body) {
//         body.style.height = "100dvb";
//         body.style.overflow = "hidden";
//       }
//     } else {
//       resetBodyStyle();
//     }

//     // Add event listener for browser navigation
//     window.addEventListener("popstate", resetBodyStyle);

//     // Clean up the event listener when the component unmounts or image changes
//     return () => {
//       window.removeEventListener("popstate", resetBodyStyle);
//     };
//   }, [image]);
//   // useEffect(() => {
//   //   const body = document.querySelector("body");
//   //   if (typeof image === "string") {
//   //     if (body) {
//   //       body.style.height = "100dvb";
//   //       body.style.overflow = "hidden";
//   //     }
//   //   } else {
//   //     if (body) {
//   //       body.style.height = "unset";
//   //       body.style.overflow = "unset";
//   //     }
//   //   }
//   // }, [image]);
//   return (
//     <>
//       {image ? (
//         <div className=" fixed flex items-center justify-center z-[9999] left-0 top-0 w-full h-[100dvb] bg-red-[rgba(0,0,0,0.3)] select-none  backdrop-blur-sm  backdrop-brightness-50 ">
//           <Button
//             variant="secondary"
//             className=" absolute right-5 top-10 rounded-full  w-7 h-7 p-0 text-gray-800 hover:text-black"
//           >
//             <IoIosClose size={50} />
//           </Button>
//           <ClickAwayListener
//             mouseEvent="onMouseUp" // the default mode by the way
//             touchEvent="onTouchEnd" // here we are telling it to call the onClickAway when the user touch the screen to make it work right on mobile phones
//             onClickAway={(e) => {
//               // Prevent the click from propagating and triggering the image view again
//               e.preventDefault();
//               handleClose();
//             }}
//           >
//             {/* <ImageComp image={image} /> */}
//             <img
//               src={image}
//               alt={image}
//               className=" max-w-[100%]  max-h-[75dvh] sm:max-h-[95dvh] object-contain"
//             />
//           </ClickAwayListener>
//         </div>
//       ) : null}
//     </>
//   );
// };

// export default ImageView;
