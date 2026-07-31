import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Action to add an item to the cart
    addToCart: (state, action) => {
      state.items = [...state.items, action.payload];
    },
    // Action to remove an item from the cart
    removeFromCart: (state, action) => {
      const index = state.items.findIndex((cartItem) => cartItem.id === action.payload.id);
      let newCart = [...state.items];
      
      if (index >= 0) {
        newCart.splice(index, 1);
      } else {
        console.warn(`Cant remove product (id: ${action.payload.id}) as it's not in the cart!`);
      }
      
      state.items = newCart;
    },
    // Action to empty the cart completely after checkout
    clearCart: (state) => {
      state.items = [];
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

// Selector to pull the cart items from the global store
export const selectItems = (state) => state.cart.items;

export default cartSlice.reducer;