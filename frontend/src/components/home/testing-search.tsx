"use client";

import { CommandInput } from "@components/search-command/CommandInput";
import { CommandItem } from "@components/search-command/CommandItem";
import { CommandList } from "@components/search-command/CommandList";
import { CommandPalette } from "@components/search-command/CommandPalette";
import React from "react";

const TestingSearch = () => {
  const handleSelect = (itemValue: string) => {
    console.log(`Item selected: ${itemValue}`);
    // You could navigate, open a modal, etc.
    alert(`You selected: ${itemValue}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Custom Command Palette</h1>
      <CommandPalette>
        <CommandInput />
        <CommandList className=" bg-background">
          {/* Group 1 */}
          <div className="cmdk-group">
            <div className="cmdk-group-heading">Fruits</div>
            <CommandItem value="apple" keywords={["fruit", "red"]}>
              <span>🍎</span> Apple
            </CommandItem>
            <CommandItem
              value="banana"
              keywords={["fruit", "yellow"]}
              onValueSelect={handleSelect}
            >
              <span>🍌</span> Banana
            </CommandItem>
            <CommandItem value="orange" keywords={["fruit", "citrus"]}>
              <span>🍊</span> Orange
            </CommandItem>
          </div>

          {/* Group 2 */}
          <div className="cmdk-group">
            <div className="cmdk-group-heading">Actions</div>
            <CommandItem value="copy" keywords={["clipboard", "action"]}>
              Copy to Clipboard
            </CommandItem>
            <CommandItem value="paste" keywords={["clipboard", "action"]}>
              Paste
            </CommandItem>
            <CommandItem value="settings" keywords={["preferences", "config"]}>
              Open Settings
            </CommandItem>
            <CommandItem value="logout" keywords={["sign out", "exit"]}>
              Log Out
            </CommandItem>
          </div>

          {/* More items */}
          <CommandItem value="about" keywords={["info", "help"]}>
            About This App
          </CommandItem>
          <CommandItem value="contact" keywords={["support", "email"]}>
            Contact Us
          </CommandItem>
        </CommandList>
      </CommandPalette>

      <p className="mt-8 text-center text-gray-600">
        Start typing in the search box to filter items. Use Up/Down arrows to
        navigate and Enter to select.
      </p>
    </div>
  );
};

export default TestingSearch;
