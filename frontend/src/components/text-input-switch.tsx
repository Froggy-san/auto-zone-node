import { useToast } from "@hooks/use-toast";
import { editCategoryAction } from "@lib/actions/categoriesAction";
import { editProductBrandAction } from "@lib/actions/productBrandsActions";
import { editProductTypeAction } from "@lib/actions/productTypeActions";
import { Category } from "@lib/types";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import SuccessToastDescription, { ErorrToastDescription } from "./toast-items";

type ItemType = "category" | "productType" | "productBrand";

export default function TextInputSwitch({
  item,
  ItemType,
  setLoading,
  isLoading,
}: {
  setLoading: React.Dispatch<SetStateAction<boolean>>;
  item: { id: number; name: string };
  ItemType: ItemType;
  isLoading: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const [width, setWidth] = useState(0);
  const { toast } = useToast();
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = useCallback(async () => {
    try {
      setLoading(true);
      if (ItemType === "category") {
        const { error } = await editCategoryAction({
          category: value,
          id: item.id,
        });

        if (error) throw new Error(error);
      }

      if (ItemType === "productBrand") {
        const { error } = await editProductBrandAction({
          productBrand: value,
          id: item.id,
        });

        if (error) throw new Error(error);
      }

      if (ItemType === "productType") {
        const { error } = await editProductTypeAction({
          productType: value,
          id: item.id,
        });

        if (error) throw new Error(error);
      }

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Success.",
        description: (
          <SuccessToastDescription message="Data has been updated." />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong while updating the data.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setLoading(false);
    }
  }, [item, value, ItemType, toast, setLoading]);

  useEffect(() => {
    if (spanRef.current) {
      const currantWidth = spanRef.current.offsetWidth + 30;
      setWidth(currantWidth);
    }
  }, [spanRef, value, setWidth, ItemType]);

  return (
    <div className=" flex-1 max-w-[97%]">
      <span
        ref={spanRef}
        className=" w-fit max-w-full break-all absolute invisible"
      >
        {value}
      </span>
      {isEditing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputRef.current) {
              inputRef.current.blur();
            }
          }}
          onBlur={async () => {
            setIsEditing(false);
            if (item.name.trim() === value.trim() || !value.trim().length)
              return;
            await handleEdit();
          }}
          autoFocus
          className="h-full max-w-full rounded-sm border-[2px] px-2 text-sm font-semibold "
          style={{ width: `${width}px` }}
        />
      ) : (
        <span
          onClick={() => {
            if (isLoading) return;
            setIsEditing(true);
          }}
          className=" cursor-pointer truncate"
        >
          {item.name}
        </span>
      )}
    </div>
  );
}
