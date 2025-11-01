    import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setAddresses(state, action) {
      state.addresses = action.payload;
    },
    addAddress(state, action) {
      state.addresses.push(action.payload);
    },
    updateAddress(state, action) {
      const updatedAddress = action.payload;
      const index = state.addresses.findIndex(addr => addr.addressId === updatedAddress.addressId);
      if (index !== -1) {
        state.addresses[index] = updatedAddress;
      }
    },
    removeAddress(state, action) {
      state.addresses = state.addresses.filter(addr => addr.addressId !== action.payload);
      if (state.selectedAddress?.addressId === action.payload) {
        state.selectedAddress = null;
      }
    },
    setSelectedAddress(state, action) {
      state.selectedAddress = action.payload;
    },
    clearSelectedAddress(state) {
      state.selectedAddress = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setSelectedAddress,
  clearSelectedAddress,
  setLoading,
  setError,
} = addressSlice.actions;

export default addressSlice.reducer;
