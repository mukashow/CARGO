import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPhoneCode,
  fetchPhoneType,
  fetchPhoneTypeOne,
  fetchPhoneTypes,
  fetchPhoneTypesFilter,
} from '@actions/phone';

const initialState = {
  phoneCode: [],
  phoneType: [],
  phoneTypes: null,
  phoneTypesFilter: null,
  phoneTypeOne: null,
};

export const phone = createSlice({
  name: 'phone',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchPhoneCode.fulfilled]: (state, { payload }) => {
      state.phoneCode = payload;
    },
    [fetchPhoneType.fulfilled]: (state, { payload }) => {
      state.phoneType = payload;
    },
    [fetchPhoneTypes.fulfilled]: (state, { payload }) => {
      state.phoneTypes = payload;
    },
    [fetchPhoneTypesFilter.fulfilled]: (state, { payload }) => {
      state.phoneTypesFilter = payload;
    },
    [fetchPhoneTypeOne.fulfilled]: (state, { payload }) => {
      state.phoneTypeOne = payload;
    },
  },
});

export const {} = phone.actions;

export default phone.reducer;
