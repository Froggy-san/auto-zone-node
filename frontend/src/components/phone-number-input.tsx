"use client";
import React, { useState, useRef } from "react";

// Helper function to format the phone number
const formatPhoneNumber = (value: string) => {
  if (!value) return "";
  const phoneNumber = value.replace(/[^\d]/g, ""); // Remove all non-digits

  // Apply your desired formatting pattern
  if (phoneNumber.length <= 3) {
    return phoneNumber;
  }
  if (phoneNumber.length <= 6) {
    console.log(phoneNumber.slice(3));
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  if (phoneNumber.length <= 10) {
    // For a 10-digit number like (123) 456-7890
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  }
  // For numbers longer than 10, you might add more rules or truncate
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)} ${phoneNumber.slice(10)}`;
};

const PhoneNumberInputManual = () => {
  const [displayValue, setDisplayValue] = useState("");
  //   const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const previousValue = displayValue; // The value *before* this change
    const cursorPosition = input.selectionStart || 0; // Cursor position *before* the change

    const unformattedValue = input.value.replace(/[^\d]/g, ""); // Get raw digits
    const formattedValue = formatPhoneNumber(unformattedValue);

    setDisplayValue(formattedValue);

    // --- Cursor position management (simplified, can be very complex for all edge cases) ---
    // This part is the main reason to use a library.
    // Basic idea: figure out how many non-digit characters were inserted/removed
    // before the cursor's original position, and adjust the cursor by that amount.

    // Calculate how many non-digits were in the part of the string before the cursor
    const previousNonDigitsCount = previousValue
      .substring(0, cursorPosition)
      .replace(/\d/g, "").length;
    const currentNonDigitsCount = formattedValue
      .substring(
        0,
        cursorPosition + (formattedValue.length - previousValue.length)
      )
      .replace(/\d/g, "").length;

    const newCursorPosition =
      cursorPosition + (currentNonDigitsCount - previousNonDigitsCount);

    // Use setTimeout to ensure the DOM updates before setting selection range
    // setTimeout(() => {
    //   if (inputRef.current) {
    //     inputRef.current.setSelectionRange(
    //       newCursorPosition,
    //       newCursorPosition
    //     );
    //   }
    // }, 0);
  };

  return (
    <div>
      <label htmlFor="phoneNumberManual">Phone Number (Manual):</label>
      <input
        id="phoneNumberManual"
        // ref={inputRef}
        type="tel" // Use type="tel" for phone numbers for better mobile keyboard
        value={displayValue}
        onChange={handleInputChange}
        placeholder="(123) 456-7890"
        className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-sm text-gray-500 mt-1">
        Raw Value: {displayValue.replace(/[^\d]/g, "")}
      </p>
    </div>
  );
};

export default PhoneNumberInputManual;
