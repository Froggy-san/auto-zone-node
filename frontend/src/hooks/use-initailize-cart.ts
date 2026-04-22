import { setCart } from "@components/cart/cartSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function useInitializeCart() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cartData = sessionStorage.getItem("cart");
      if (cartData) {
        dispatch(setCart(JSON.parse(cartData)));
      }
    }
  }, [dispatch]);
}
