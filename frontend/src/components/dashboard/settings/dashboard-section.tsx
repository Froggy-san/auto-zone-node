import React from "react";
import ShowDashboardToggle from "./show-dashboard-toggle";

const DashboardSection = () => {
  return (
    <section className=" mt-10  space-y-5">
      <h3 className=" font-semibold">DASHBOARD SETTINGS</h3>
      <ShowDashboardToggle />
    </section>
  );
};

export default DashboardSection;
