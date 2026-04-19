"use client";
import React, { createContext, useContext } from "react";
import { useInView } from "react-intersection-observer";

interface ContextProps {
  ref: (node?: Element | null) => void;
  inView: boolean;
}

const Context = createContext<ContextProps>({
  ref: (node?: Element | null) => {},
  inView: false,
});

function IntersectionProvidor({ children }: { children: React.ReactNode }) {
  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
  });
  return (
    <Context.Provider value={{ ref, inView }}>{children}</Context.Provider>
  );
}

function useIntersectionProvidor() {
  const context = useContext(Context);

  if (!context)
    throw new Error("You used the intersection provdior context wrong!");
  return context;
}

export { useIntersectionProvidor };
export default IntersectionProvidor;
