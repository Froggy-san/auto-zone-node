"use client";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
export const LENGHT_OF_STRING = 500;

import { Link } from "react-scroll";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface CollapseContextValue {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setShowCollapseBtn: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  showCollapseBtn: boolean;
  textLenght?: number;
}

const CollapseContext = createContext<CollapseContextValue>({
  setIsOpen: () => {},
  isOpen: false,
  setShowCollapseBtn: () => {},
  showCollapseBtn: false,
  textLenght: LENGHT_OF_STRING,
});

interface CollapseProps {
  children: ReactNode;
  textLenght?: number;
  onClick?: (e?: MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  scrollOnCollapse?: boolean;
}

const Collapse = function ({
  children,
  textLenght = LENGHT_OF_STRING,
  onClick,
  className,
  scrollOnCollapse = true,
  style,
}: CollapseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCollapseBtn, setShowCollapseBtn] = useState(false);
  // we need to know if the user is using a bigger screen or not, because if not, and the text length is too big the text will look bad and too much, thus we need to make the text more appealing by dividing the text length by 2, the number 2 it self is a random number i picked up feel free to change it.

  const isBigScreen = useMediaQuery("(min-width: 768px)");
  const isTextBig = textLenght > 600;
  const textLenghtinScreen =
    !isBigScreen && isTextBig ? textLenght / 2 : textLenght;
  return (
    <CollapseContext.Provider
      value={{
        isOpen,
        setIsOpen,
        textLenght: textLenghtinScreen,
        setShowCollapseBtn,
        showCollapseBtn,
      }}
    >
      <Link
        to={isOpen && scrollOnCollapse ? "collapse-contant" : ""}
        smooth
        offset={-30}
        duration={150}
      >
        <div
          onClick={() => onClick?.()}
          className={`relative ${className}`}
          style={style}
        >
          {children}
        </div>
      </Link>
    </CollapseContext.Provider>
  );
};

///           Contant

const CollapseContant = forwardRef(
  (
    {
      children,
      onClick,
      ariaLabel,
      className,
      style,
    }: {
      children: ReactNode;
      onClick?: (e?: MouseEvent) => void;
      ariaLabel?: string;
      className?: string;
      style?: React.CSSProperties;
    },
    ref?: React.Ref<HTMLParagraphElement>
  ) => {
    const { isOpen, setIsOpen, textLenght, setShowCollapseBtn } =
      useContext(CollapseContext);

    const isString = typeof children === "string";

    if (!isString)
      console.error(
        "inside the CollapsibleContant must be a string not a component nor an element."
      );

    const isBigEnough =
      isString && children.length > (textLenght || LENGHT_OF_STRING);

    const text =
      isBigEnough && !isOpen ? children.slice(0, textLenght) + "..." : children;

    useEffect(() => {
      if (isBigEnough) {
        setShowCollapseBtn(true);
      } else {
        setShowCollapseBtn(false);
      } // when ever changing the textLenght refresh the page in order for this state to take effect.
    }, [isBigEnough]);

    // // Separate components from text
    // const components = React.Children.toArray(children).filter((child) =>
    //   React.isValidElement(child)
    // );

    return (
      <p
        ref={ref}
        id="collapse-contant"
        onClick={() => {
          if (isOpen) setIsOpen(false);
          onClick?.();
        }}
        aria-label={ariaLabel}
        className={`mt-5 whitespace-pre-wrap break-all ${className}`}
        style={style}
      >
        {isString ? text : children}
      </p>
    );
  }
);

///           Button
export type variant =
  | "link"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined;

interface CollapseButtonProps {
  className?: string;
  arrowPositionX?: "right" | "left" | null | undefined;
  arrowPositionY?: "top" | "bottom" | null | undefined;
  onClick?: (e?: MouseEvent) => void;
  variant?: variant;
  style?: React.CSSProperties;
  buttonTextWhenOpen?: string | ReactNode;
  buttonTextWhenClosed?: string | ReactNode;
}

const CollapseButton = forwardRef(
  (
    {
      className,
      arrowPositionX,
      arrowPositionY,
      variant,
      style,
      buttonTextWhenClosed,
      buttonTextWhenOpen,

      onClick,
    }: CollapseButtonProps,
    ref?: React.Ref<HTMLButtonElement>
  ) => {
    const { showCollapseBtn, isOpen, setIsOpen } = useContext(CollapseContext);
    return (
      <>
        {showCollapseBtn && (
          <Button
            ref={ref}
            className={`absolute  p-0 h-6 w-6 bottom-[-45px] z-20 ${arrowPositionY}-0 ${arrowPositionX}-0 ${className}`}
            style={style}
            variant={variant || "ghost"}
            onClick={() => {
              onClick?.();
              setIsOpen((is) => !is);
            }}
          >
            {buttonTextWhenClosed || buttonTextWhenOpen ? (
              <>{!isOpen ? buttonTextWhenClosed : buttonTextWhenOpen}</>
            ) : (
              <>
                {" "}
                {!isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </>
            )}
          </Button>
        )}
      </>
    );
  }
);

export function useCollapse() {
  const context = useContext(CollapseContext);
  if (!context) throw new Error(`you have used the SearchContext wrong`);
  return context;
}

CollapseButton.displayName = "CollapseButton";
CollapseContant.displayName = "CollapseContant";
Collapse.CollapseContant = CollapseContant;
Collapse.CollapseButton = CollapseButton;

export { CollapseButton, CollapseContant };
export default Collapse;
