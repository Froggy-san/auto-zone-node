import SubmitButton from "@components/submit-button"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items"

import { Input } from "@components/ui/input"
import { useToast } from "@hooks/use-toast"
import { createProductBrandAction } from "@lib/actions/productBrandsActions"

import { SendHorizontal } from "lucide-react"
import React, { useState } from "react"

const ProductBrandForm = () => {
  const [value, setValue] = useState("")
  const { toast } = useToast()

  const disabled = value.trim() === ""
  async function handleSubmit() {
    try {
      await createProductBrandAction(value)
      setValue("")
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="A new product brand has been created." />
        ),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      })
    }
  }
  return (
    <form action={handleSubmit}>
      {" "}
      <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
        <div className="space-y-0.5">
          <label htmlFor="z" className="font-semibold">
            Product brand
          </label>
          <p className="text-sm text-muted-foreground">Add product brand.</p>
        </div>
        <div className="flex items-center gap-3 sm:pr-2">
          <Input
            type="text"
            placeholder="Product brand..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            id="z"
          />

          <SubmitButton disabled={disabled} className="h-8 w-8 p-2">
            <SendHorizontal size={20} />
          </SubmitButton>
        </div>
      </div>
    </form>
  )
}

export default ProductBrandForm
