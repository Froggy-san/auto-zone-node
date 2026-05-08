import * as React from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { MonitorCog } from "lucide-react"
import { useTheme } from "./theme-provider"

// import sound from "@public/sound/mixkit-on-or-off-light-switch-tap-2585.wav";
export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const audioRef = React.useRef<HTMLAudioElement>(null)

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  return (
    <div className="flex h-full w-fit items-center rounded-lg border bg-background">
      <Button
        onClick={() => {
          playSound()
          setTheme("light")
        }}
        variant="ghost"
        className={`flex h-7 w-7 items-center justify-center rounded-full border-none p-0 ${
          theme === "light" ? "bg-secondary" : ""
        }`}
      >
        {" "}
        <SunIcon className="h-3 w-3 scale-100 rotate-0" />
      </Button>
      <Button
        onClick={() => {
          playSound()
          setTheme("system")
        }}
        variant="ghost"
        className={`flex h-7 w-7 items-center justify-center rounded-full border-none p-0 ${
          theme === "system" ? "bg-secondary" : ""
        }`}
      >
        {" "}
        <MonitorCog className="h-3 w-3 scale-100 rotate-0" />
      </Button>

      <Button
        onClick={() => {
          playSound()
          setTheme("dark")
        }}
        variant="ghost"
        className={`flex h-7 w-7 items-center justify-center rounded-full border-none p-0 ${
          theme === "dark" ? "bg-secondary" : ""
        }`}
      >
        {" "}
        <MoonIcon className="h-3 w-3 scale-100 rotate-0" />
      </Button>
      <audio
        ref={audioRef}
        src="https://mywarsha.blob.core.windows.net/mywarshaimages/mixkit-on-or-off-light-switch-tap-2585.wav"
      />
    </div>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button variant="ghost" size="icon" className=" rounded-full">
    //       <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    //       <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    //       <span className="sr-only">Toggle theme</span>
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end">
    //     <DropdownMenuItem onClick={() => setTheme("light")}>
    //       Light
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme("dark")}>
    //       Dark
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme("system")}>
    //       System
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  )
}
