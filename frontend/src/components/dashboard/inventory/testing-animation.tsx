"use client";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import React, { useState } from "react";

const TestingAnimation = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen((is) => !is)}>Open</Button>
      <div
        className={cn("w-[250px] h-52 rounded-md bg-accent border dialog", {
          "dialog-open": open,
          "dialog-closed": !open,
        })}
      >
        TestingAnimation <br />
        {open ? "open" : "closed"}
      </div>
    </>
  );
};

export default TestingAnimation;
