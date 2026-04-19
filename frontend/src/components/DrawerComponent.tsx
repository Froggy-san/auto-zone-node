import { cn } from "@lib/utils";
import React, {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";
import { ClickAwayListener, Portal } from "@mui/material";
import { Cross2Icon } from "@radix-ui/react-icons";

interface DrawerContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  handleOpenChange: () => void;
  handleClose: () => void;
}

const DrawerContext = createContext<DrawerContextProps>({
  isOpen: false,
  setIsOpen: () => {},
  handleOpenChange: () => {},
  handleClose: () => {},
});

interface DrawerProvidorProps {
  children: React.ReactElement;
  open?: boolean;
  setOpen?: React.Dispatch<SetStateAction<boolean>>;
}

function DrawerProvidor({ children, open, setOpen }: DrawerProvidorProps) {
  const [isOpen, setIsOpen] = useState(open !== undefined ? open : false);
  useEffect(() => {
    const body = document.querySelector("body");
    if (window !== undefined && body) {
      body.style.overflow = isOpen ? "hidden" : "visible";
    }
    return () => {
      if (body) body.style.overflow = "visible";
    };
  }, [isOpen]);
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  function handleOpenChange() {
    setIsOpen((open) => !open);
    if (setOpen) setOpen((open) => !open);
  }
  function handleClose() {
    setIsOpen(false);
    if (setOpen) setOpen(false);
  }

  return (
    <DrawerContext.Provider
      value={{ isOpen, setIsOpen, handleOpenChange, handleClose }}
    >
      {" "}
      <ClickAwayListener onClickAway={handleClose}>
        {children}
      </ClickAwayListener>{" "}
    </DrawerContext.Provider>
  );
}

const DrawerTrigger = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ children, onClick, ...props }, ref) => {
  const { handleOpenChange } = useContext(DrawerContext);
  return (
    <button
      onClick={(e) => {
        onClick?.(e);
        handleOpenChange();
      }}
      {...props}
      ref={ref}
    >
      {children}
    </button>
  );
});

const DrawerClose = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ children, onClick, ...props }, ref) => {
  const { handleClose } = useContext(DrawerContext);
  return (
    <button onClick={handleClose} {...props} ref={ref}>
      {children}
    </button>
  );
});

interface DrawerOverlayProps {
  show?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const DrawerOverlay = React.forwardRef<HTMLDivElement, DrawerOverlayProps>(
  ({ className, show = true, ...props }, ref) => {
    const { isOpen, handleClose } = useContext(DrawerContext);

    if (!show) return null;

    return (
      <Portal>
        <motion.div
          onClick={handleClose}
          variants={{
            open: { opacity: 1, visibility: "visible" },
            close: { opacity: 0, visibility: "hidden" },
          }}
          initial={isOpen ? "open" : "close"}
          animate={isOpen ? "open" : "close"}
          exit={isOpen ? "open" : "close"}
          transition={{ duration: 0.15 }}
          className={cn(
            "fixed inset-0 !z-[2] bg-black/80",
            className
            // { block: open },
            // { hidden: !open }
          )}
          ref={ref}
          {...props}
        />
      </Portal>
    );
  }
);

interface DrawerContentProps {
  children?: React.ReactNode;
  className?: string;
  asCard?: boolean;
}
const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, asCard }, externalRef) => {
    const { isOpen } = useContext(DrawerContext);

    const internalRef = useRef<HTMLDivElement>(null);
    const ref =
      (externalRef as React.MutableRefObject<HTMLDivElement>) || internalRef;
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
      if (ref && ref.current) {
        setHeight(ref.current.offsetHeight);
      }
    }, [ref, isOpen]);

    return (
      <Portal>
        <motion.div
          ref={ref}
          variants={{
            open: {
              translateY: "0%",
              translateX: asCard ? "-50%" : "0%",
              opacity: 1,
              visibility: "visible",
              transition: {
                type: "tween",
                duration: 0.2,
              },
            },
            close: {
              translateY: `${height}px`,
              translateX: asCard ? "-50%" : "0%",
              opacity: 0,
              visibility: "hidden",
              // transition: { duration: 0.05 },
            },
          }}
          initial="close"
          animate={isOpen ? "open" : "close"}
          exit="close"
          className={cn(
            "fixed left-0 bottom-0 antialiased z-50 w-full mb border bg-background  shadow-lg sm:rounded-t-lg",
            {
              " left-1/2 -translate-x-1/2 mx-auto mb-4 rounded-xl w-[97%]":
                asCard,
            },
            className
          )}
        >
          {children}
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <Cross2Icon className="h-4 w-4" />
            {/* <span className="sr-only">Close</span> */}
          </DrawerClose>
        </motion.div>
      </Portal>
    );
  }
);

DrawerClose.displayName = "DrawerClose";
DrawerTrigger.displayName = "DrawerTrigger";
DrawerContent.displayName = "DrawerContent";
DrawerOverlay.displayName = "DrawerOverlay";

export {
  DrawerProvidor,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerOverlay,
};

export function useDrawerContext() {
  const context = useContext(DrawerContext);
  if (!context)
    throw new Error("you have used the drawer context in the wrong place");
  return context;
}
