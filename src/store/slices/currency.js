import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllCurrencies,
  fetchCurrencies,
  fetchCurrencyOne,
  fetchRates,
} from '@actions/currency';

const initialState = {
  allCurrencies: [],
  currencies: null,
  currencyOne: null,
  rates: null,
};

export const currency = createSlice({
  name: 'currency',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchAllCurrencies.fulfilled]: (state, { payload }) => {
      state.allCurrencies = payload;
    },
    [fetchCurrencies.fulfilled]: (state, { payload }) => {
      state.currencies = payload;
    },
    [fetchCurrencyOne.fulfilled]: (state, { payload }) => {
      state.currencyOne = payload;
    },
    [fetchRates.fulfilled]: (state, { payload }) => {
      state.rates = payload;
    },
    [fetchRates.rejected]: state => {
      state.rates = {};
    },
  },
});

export const {} = currency.actions;

export default currency.reducer;
