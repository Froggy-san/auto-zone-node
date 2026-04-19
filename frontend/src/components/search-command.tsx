import React, { createContext } from "react";

interface SearchCommand {}

const SearchCommandContext = createContext<SearchCommand>({});

interface SearchProps {
  children: React.ReactNode;
  value: string;
  onValueChange: React.SetStateAction<React.Dispatch<string>>;
}

function Search({ children }: SearchProps) {
  return (
    <SearchCommandContext.Provider value={{}}>
      {children}
    </SearchCommandContext.Provider>
  );
}

// 1. Use React.ComponentPropsWithRef<'button'> to include the 'ref' prop
type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  // 2. Add your custom properties here
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
};

// 3. Use React.forwardRef and explicitly type the ref (HTMLButtonElement)
//    and the component's props (ButtonProps)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      children,
      className,
      ...rest // All other standard HTML button props, including the ref implicitly
    },
    ref // This is the ref passed by the parent component
  ) => {
    const baseClasses = "px-4 py-2 rounded font-semibold";
    const variantClasses = {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-600",
    }[variant];

    const loadingClasses = isLoading ? "opacity-70 cursor-not-allowed" : "";

    return (
      <button
        ref={ref} // 4. Attach the forwarded ref to the native HTML button element
        className={`${baseClasses} ${variantClasses} ${loadingClasses} ${
          className || ""
        }`}
        disabled={isLoading || rest.disabled} // Combine your disabled with passed disabled
        {...rest} // Spread the rest of the HTML button props
      >
        {isLoading ? "Loading..." : children}
      </button>
    );
  }
);

// 5. Add a displayName for better debugging in React DevTools
Button.displayName = "Button";

export default Button;
