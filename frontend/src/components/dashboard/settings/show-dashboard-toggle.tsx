"use client";
import { Switch } from "@components/ui/switch";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ShowDashboardToggle = () => {
  //   const storageItem = localStorage.getItem("showDashboard");
  const [show, setShow] = useState<boolean>(true);

  useEffect(() => {
    const storageItem = localStorage.getItem("showDashboard");
    if (storageItem !== null) {
      setShow(JSON.parse(storageItem));
    }
  }, []);

  return (
    <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Show dashboard</label>
        <p className=" text-muted-foreground text-sm">
          Decide whether the dash board should be showen or not in the{" "}
          <Link href="/dashboard" className=" text-primary   font-semibold">
            Dashboard home page
          </Link>
        </p>
      </div>
      <div className=" sm:pr-2">
        <Switch
          checked={show}
          onClick={() => {
            const newShow = !show;
            setShow(newShow);
            localStorage.setItem("showDashboard", JSON.stringify(newShow));
          }}
        />
      </div>
    </div>
  );
};

export default ShowDashboardToggle;
