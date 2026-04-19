"use client";

import { RootState } from "@lib/store/store";
import { CartItem, ProductById } from "@lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

function setCartInSession(cart: CartItem[]) {
  try {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to sessionStorage:", error);
  }
}

type Client = {
  name: string;
  phone: string;
  email: string;
};
const initialState: {
  cart: CartItem[];
  date: string | undefined;
  client: Client | undefined;
} = {
  cart: [],
  date: undefined,
  client: undefined,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.cart = action.payload;
    },

    addItemToCart(state, action: PayloadAction<ProductById>) {
      // 1. check if the same items with the same properties exist in the cart.
      // 2. if so find it.
      const sameItem = state.cart.find((item) => item.id === action.payload.id);

      // 3. set a unique id so we can find that varient of the product later on just so the user could delete or increase/decrease it's quantity  form the cart, and then add increase the quantity of the the product by the amount requested.
      if (sameItem) {
        sameItem.quantity++;

        sameItem.totalPrice = sameItem.salePrice * sameItem.quantity;
      } else {
        // 4. Else if the product doesn't exist already in the cart just add it. that way if the user adds it again the above will apply.
        state.cart.push({
          ...action.payload,
          quantity: 1,
          totalPrice: action.payload.salePrice,
        });
      }

      setCartInSession(state.cart);
    },
    // here we are deleting the prodcut with the itemId, becasue every product can be bought with different color/size
    deleteCartItem(state, action: PayloadAction<number>) {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
      setCartInSession(state.cart);
    },

    // deleteAllRelatedItems(state, action) {
    //   state.cart = state.cart.filter((item) => item.id !== action.payload);
    // },
    increaseItemQuantity(state, action: PayloadAction<number>) {
      const item = state.cart.find((item) => item.id === action.payload);

      if (item && item.stock) {
        if (item.quantity === item.stock) return;
        item.quantity++;
        item.totalPrice = item.salePrice * item.quantity;
        setCartInSession(state.cart);
      }
    },

    decreaseItemQuantity(state, action: PayloadAction<number>) {
      const item = state.cart.find((item) => item.id === action.payload);

      if (item && item.stock) {
        if (item.quantity === 0) return;
        item.quantity--;

        item.totalPrice = item.quantity * item.salePrice;

        if (item.quantity === 0)
          cartSlice.caseReducers.deleteCartItem(state, action);
      }

      setCartInSession(state.cart);
    },

    clearCart(state) {
      state.date = undefined;
      state.cart = [];
      setCartInSession(state.cart);
    },

    setDate(state, action: PayloadAction<string | undefined>) {
      state.date = action.payload;
    },

    setClient(state, action: PayloadAction<Client | undefined>) {
      state.client = action.payload;
    },
  },
});

export const {
  addItemToCart,
  deleteCartItem,
  increaseItemQuantity,
  decreaseItemQuantity,
  clearCart,
  setCart,
  setDate,
  setClient,
} = cartSlice.actions;

export default cartSlice.reducer;

export const getCart = (state: RootState) => state.cartData.cart;
export const getClient = (state: RootState) => state.cartData.client;
export const getDate = (state: RootState) => state.cartData.date;

export const getTotalItemQuantity = (state: RootState) =>
  state.cartData.cart.reduce((sum, curEl) => sum + curEl.quantity, 0);

export const getTotalCartPrices = (state: RootState) =>
  state.cartData.cart.reduce((sum, curEl) => sum + curEl.totalPrice, 0);
