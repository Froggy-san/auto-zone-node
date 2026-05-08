import { Button } from "@components/ui/button"
import { cn } from "@lib/utils"
import React, { useState } from "react"

const TestingAnimation = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen((is) => !is)}>Open</Button>
      <div
        className={cn("dialog h-52 w-[250px] rounded-md border bg-accent", {
          "dialog-open": open,
          "dialog-closed": !open,
        })}
      >
        TestingAnimation <br />
        {open ? "open" : "closed"}
      </div>
    </>
  )
}

export default TestingAnimation
