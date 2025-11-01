import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartId: null, // this will hold the cartId from backend or generated
    items: [],    // [{ product: {...}, quantity: number }]
  },
  reducers: {
    setCartId: (state, action) => {
      state.cartId = action.payload;
    },

    addItem: (state, action) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product._id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },

    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.product._id !== action.payload);
    },

    clearCart: (state) => {
      state.cartId = null;
      state.items = [];
    },
  },
});

// Export actions and reducer
export const { setCartId, addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
