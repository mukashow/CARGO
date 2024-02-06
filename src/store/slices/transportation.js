import { createSlice } from '@reduxjs/toolkit';
import { fetchTransportationType } from '@actions/transportation';

const initialState = {
  transportationType: [],
};

export const transportation = createSlice({
  name: 'transportation',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchTransportationType.fulfilled, (state, { payload }) => {
      state.transportationType = payload;
    });
  },
});

export const {} = transportation.actions;

export default transportation.reducer;
