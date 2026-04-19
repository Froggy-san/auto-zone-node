"use client";
import dynamic from "next/dynamic";
import React from "react";

const StatusBadge = dynamic(() => import("../status-badge"), {
  loading: () => <p>Loading...</p>,
});
const ControlTheme = () => {
  // const [chosenTheme, setChosenTheme] = useState("dark")
  return <div>ControlTheme</div>;
};

export default ControlTheme;
