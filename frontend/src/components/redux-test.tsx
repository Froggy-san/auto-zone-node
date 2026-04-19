"use client";
import React from "react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@lib/store/store";
import { decrement, increment } from "@lib/store/cartSlice";

const ReduxTest = () => {
  const count = useSelector(({ counter }: RootState) => counter.value);
  const dispatch = useDispatch();
  return (
    <div className=" flex items-center gap-5">
      <Button onClick={() => dispatch(increment())}>Increment </Button>
      <span>{count}</span>
      <Button onClick={() => dispatch(decrement())}>Decrement</Button>
    </div>
  );
};

export default ReduxTest;
