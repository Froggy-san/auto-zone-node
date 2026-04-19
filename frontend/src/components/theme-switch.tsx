"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { MonitorCog } from "lucide-react";

// import sound from "@public/sound/mixkit-on-or-off-light-switch-tap-2585.wav";
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div className=" h-full flex  bg-background  items-center  w-fit    rounded-lg border">
      <Button
        onClick={() => {
          playSound();
          setTheme("light");
        }}
        variant="ghost"
        className={`p-0 flex items-center border-none justify-center rounded-full   w-7 h-7  ${
          theme === "light" ? "bg-secondary" : ""
        }`}
      >
        {" "}
        <SunIcon className="h-3 w-3 rotate-0 scale-100   " />
      </Button>
      <Button
        onClick={() => {
          playSound();
          setTheme("system");
        }}
        variant="ghost"
        className={`p-0 flex items-center border-none justify-center rounded-full   w-7 h-7  ${
          theme === "system" ? "bg-secondary" : ""
        }`}
      >
        {" "}
        <MonitorCog className="h-3 w-3 rotate-0 scale-100   " />
      </Button>

      <Button
        onClick={() => {
          playSound();
          setTheme("dark");
        }}
        variant="ghost"
        className={`p-0 flex items-center border-none justify-center rounded-full   w-7 h-7  ${
          theme === "dark" ? "bg-secondary" : ""
        }`}
      >
        {" "}
        <MoonIcon className="h-3 w-3 rotate-0 scale-100   " />
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
  );
}
