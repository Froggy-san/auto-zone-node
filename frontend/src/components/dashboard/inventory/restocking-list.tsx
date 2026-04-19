import { getRestockingBillsAction } from "@lib/actions/restockingBillActions";
import React from "react";

const RestockingList = async () => {
  const { data, error } = await getRestockingBillsAction({});

  if (error) return <p>{error}</p>;
  return <ul>RestockingList</ul>;
};

export default RestockingList;
