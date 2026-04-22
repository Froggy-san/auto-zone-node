import { cn } from "@lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import CurrencyInput, {
  CurrencyInputOnChangeValues,
} from "react-currency-input-field";

interface Props {
  onChange?: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}

const CurrencyField = ({ onChange, className }: Props) => {
  const [value, setValue] = useState("");
  console.log("VALUE", value);
  const handleValueChange = useCallback(
    (
      formattedValue: string | undefined,
      name?: string,
      values?: CurrencyInputOnChangeValues
    ) => {
      // --- Core Logic to handle "empty" state ---
      // Option 1: If formattedValue is empty or contains only non-numeric chars (like prefix)
      // and values.value (the raw numeric string) is null/empty, then truly clear.
      if (!formattedValue || (values && !values.value)) {
        setValue("");
        onChange?.(0);
        return; // Stop further processing
      }

      // Option 2 (More specific for your problem): If the raw numeric value is '0' or '0.00'
      // and the user has seemingly tried to clear it, you might want to force clear.
      // This often happens when backspacing results in "EGP 0.00" and you can't delete the '0'.
      if (values && values.value === "0") {
        // You might also check if the formattedValue is just the prefix + '0' or '0.00'
        const isJustZero =
          formattedValue === "EGP 0" || formattedValue === "EGP 0.00"; // Adjust based on your actual prefix and decimal settings

        if (isJustZero) {
          setValue("");
          onChange?.(0);
          return;
        }
      }

      // Default behavior: update states normally
      setValue(formattedValue);
      if (values) {
        onChange?.(Number(values.value)); // Store the clean numeric string
      }
    },
    [value, setValue, onChange]
  );
  useEffect(() => {
    setValue("");
  }, []);

  return (
    <CurrencyInput
      id="listPrice"
      name="price"
      placeholder="E.g., 1,234.56"
      decimalsLimit={2} // Max number of decimal places
      prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
      decimalSeparator="." // Use dot for decimal
      groupSeparator="," // Use comma for thousands
      value={value}
      onValueChange={handleValueChange}
      className={cn("input-field", className)}
    />
  );
};

export default CurrencyField;
