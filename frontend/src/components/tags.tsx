"use clinet";
import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  SetStateAction,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { IoClose } from "react-icons/io5";

import { BsSendFill } from "react-icons/bs";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
export type variant =
  | "link"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined;

export type buttonSize = "default" | "sm" | "lg" | "icon" | null | undefined;
export type buttonType = "button" | "submit" | "reset" | undefined;

interface TagsInputContextValues {
  onChange: React.Dispatch<SetStateAction<string[]>>;
  Tags: string[];
  handleAddTag: (value: string) => void;
  handleEditTag: (newString: string, index: number) => void;
  value: string;
  setValue: React.Dispatch<SetStateAction<string>>;
  isEditable?: boolean;
}

const TagsInputContext = createContext<TagsInputContextValues>({
  onChange: () => {},
  Tags: [],
  handleAddTag: () => {},
  handleEditTag: () => {},
  value: "",
  setValue: () => {},
  isEditable: true,
});
interface TagsInputProps {
  onChange: React.Dispatch<SetStateAction<string[]>>;
  Tags: string[];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  isEditable?: boolean;
}
const TagsInput = function ({
  children,
  Tags,
  onChange,
  isEditable = true,
}: TagsInputProps) {
  const [value, setValue] = useState("");
  function handleAddTag(value: string) {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onChange([...Tags, trimmedValue]);
      setValue("");
    }
  }

  function handleEditTag(newString: string, index: number) {
    onChange(Tags.map((item, i) => (i === index ? newString : item)));
  }
  return (
    <TagsInputContext.Provider
      value={{
        onChange,
        Tags,
        handleAddTag,
        handleEditTag,
        value,
        setValue,
        isEditable,
      }}
    >
      {children}
    </TagsInputContext.Provider>
  );
};

const TagsContainer = forwardRef(function (
  {
    className,
    children,
    style,
    tagsStyles,
  }: {
    className?: string;
    style?: CSSProperties;
    tagsStyles?: string;
    children?: ReactElement;
  },
  ref?: React.Ref<HTMLDivElement>
) {
  const { onChange, Tags } = useContext(TagsInputContext);
  function handleRemovingTag(index: number) {
    // Create a shallow copy of the Tags array
    const updatedTags = [...Tags];
    updatedTags.splice(index, 1); // Remove the tag at the specified index
    onChange(updatedTags); // Update the state with the modified array
  }
  return (
    <Card
      ref={ref}
      style={style}
      className={`my-10 flex flex-wrap items-center gap-1 p-2 ${
        className || ""
      }`}
    >
      {Tags.length
        ? Tags.map((tag, i) => (
            <TagItem
              itemIndex={i}
              className={tagsStyles}
              key={i}
              tag={tag}
              removeFunction={() => handleRemovingTag(i)}
            />
          ))
        : null}
      {children}
    </Card>
  );
});

TagsContainer.displayName = "TagsContainer";
function TagItem({
  itemIndex,
  tag,
  removeFunction,
  className,
}: {
  itemIndex?: number;
  className?: string;
  tag: string;
  removeFunction: () => void;
}) {
  const { handleEditTag, isEditable } = useContext(TagsInputContext);
  const [value, setValue] = useState(tag);
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      const contentWidth = spanRef.current.offsetWidth + 20;

      setWidth(contentWidth);
    }
  }, [value, setWidth, spanRef]);

  return (
    <div
      className={`show-tag relative flex h-8 max-w-[100%] items-center justify-between rounded-md border border-solid bg-primary pl-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 ${
        className || ""
      }`}
    >
      <span className="invisible absolute w-fit" ref={spanRef}>
        {value}
      </span>
      {isEditable && isEditing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            if (value.trim() !== tag.trim() && itemIndex !== undefined)
              handleEditTag(value, itemIndex);
          }}
          autoFocus
          className="h-[90%] max-w-full rounded-sm border bg-primary px-2 text-sm font-semibold text-primary-foreground"
          style={{ width: `${width}px` }}
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="flex-1 cursor-pointer truncate pb-[1px]"
        >
          {tag}
        </span>
      )}
      <button type="button" className="mx-2 mt-1 h-fit p-1">
        <IoClose onClick={removeFunction} size={15} />
      </button>
    </div>
  );
}

const TagsInputField = forwardRef(function (
  {
    className,
    style,
    placeholder,
    type,
    ariaLabel,
  }: {
    className?: string;
    placeholder?: string;
    type?: string;
    ariaLabel?: string;
    style?: CSSProperties;
  },
  ref?: React.Ref<HTMLDivElement>
) {
  const { value, setValue, handleAddTag, onChange, Tags } =
    useContext(TagsInputContext);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleAddTag(value);
    }
    if (e.code === "Backspace" && !value) {
      e.preventDefault();
      const updatedTags = [...Tags];
      updatedTags.pop(); // Remove the last tag
      onChange(updatedTags); // Update the state with the modified array
    }
  }

  return (
    <div
      ref={ref}
      className="relative h-7 min-w-[250px] flex-1 bg-background pl-3 text-foreground"
    >
      <input
        type={type || "text"}
        aria-label={ariaLabel}
        placeholder={placeholder || "Enter tools you use..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={style}
        className={`h-full w-full bg-background pr-16 focus:outline-none ${
          className || ""
        }`}
      />
      {value && (
        <Badge className="show-tag pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-foreground opacity-100 sm:flex">
          Enter
        </Badge>
      )}
    </div>
  );
});

TagsInputField.displayName = "TagsInputField";
const SendBtn = forwardRef(function (
  {
    className,
    style,
    variant,
    children,
    size,
  }: {
    className?: string;
    style?: CSSProperties;
    variant?: variant;
    size?: buttonSize;
    children?: ReactElement;
  },
  ref?: React.Ref<HTMLButtonElement>
) {
  const { value, handleAddTag } = useContext(TagsInputContext);
  const isValue = value.trim().length; // checking if the user inputed any value in the input field

  return (
    <Button
      ref={ref}
      type="button"
      onClick={() => handleAddTag(value)}
      size={size || "sm"}
      style={style}
      className={`transition-all ${
        !isValue ? "invisible opacity-0" : "visible opacity-100"
      } ${className || ""}`}
      variant={variant || "default"}
    >
      {children || <BsSendFill />}
    </Button>
  );
});

SendBtn.displayName = "SendBtn";

export function useTagsInput() {
  const context = useContext(TagsInputContext);
  if (!context)
    throw new Error(`You have used the TagsContext outside the providor`);
  return context;
}

TagsInput.TagsContainer = TagsContainer;
TagsInput.TagsInputField = TagsInputField;
TagsInput.SendBtn = SendBtn;
export default TagsInput;
