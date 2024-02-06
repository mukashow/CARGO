import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCities,
  fetchCityDetail,
  fetchCodeAndPassword,
  fetchCountries,
  fetchCountry,
  fetchCountryCities,
} from '@actions/country';

const initialState = {
  countryCodeAndPasswordState: null,
  cities: null,
  countries: null,
  country: null,
  city: null,
};

export const country = createSlice({
  name: 'country',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchCodeAndPassword.fulfilled]: (state, { payload }) => {
      state.countryCodeAndPasswordState = payload;
    },
    [fetchCities.fulfilled]: (state, { payload }) => {
      state.cities = payload;
    },
    [fetchCountries.fulfilled]: (state, { payload }) => {
      state.countries = payload;
    },
    [fetchCountry.fulfilled]: (state, { payload }) => {
      state.country = payload;
    },
    [fetchCityDetail.fulfilled]: (state, { payload }) => {
      state.city = payload;
    },
    [fetchCountryCities.fulfilled]: (state, { payload }) => {
      const foundCountry = state.countries.results.find(({ id }) => id === payload.id);
      if (foundCountry) {
        foundCountry.cities = payload.data;
      }
    },
  },
});

export const {} = country.actions;

export default country.reducer;
