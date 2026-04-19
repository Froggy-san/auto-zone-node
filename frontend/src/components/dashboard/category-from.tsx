"use client";
import SubmitButton from "@components/submit-button";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import { Input } from "@components/ui/input";
import { useToast } from "@hooks/use-toast";
import { createCategoryAction } from "@lib/actions/categoriesAction";

import { SendHorizontal } from "lucide-react";
import React, { useState } from "react";

const CategroyForm = () => {
  const [value, setValue] = useState("");

  const { toast } = useToast();

  const disabled = value.trim() === "";
  async function handleSubmit() {
    try {
      const { error } = await createCategoryAction(value);

      if (error) throw new Error(error);
      setValue("");
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="A new category has been created." />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <form action={handleSubmit}>
      {" "}
      <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
        <div className="space-y-0.5   ">
          <label htmlFor="z" className=" font-semibold">
            Category
          </label>
          <p className=" text-muted-foreground text-sm">
            Add product category.
          </p>
        </div>
        <div className=" flex items-center  gap-3 sm:pr-2">
          <Input
            placeholder="Category name..."
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            id="z"
          />

          <SubmitButton disabled={disabled} className=" p-2 w-8 h-8">
            <SendHorizontal size={20} />
          </SubmitButton>
        </div>
      </div>
    </form>
  );
};

export default CategroyForm;
