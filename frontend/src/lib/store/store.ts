import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./cartSlice";
import cartReducer from "../../components/cart/cartSlice";
export const reduxStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      cartData: cartReducer,
    },
  });
};

// Infer the type of reduxStore
export type AppStore = ReturnType<typeof reduxStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
