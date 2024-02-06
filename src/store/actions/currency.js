import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllCurrencies = createAsyncThunk(
  'currency/fetchAllCurrencies',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('currency/?no_pagination=true');
      return data.map(({ id, name }) => ({ label: name, value: id }));
    } catch ({ response: { data } }) {
      return rejectWithValue(data.detail);
    }
  }
);

export const fetchCurrencies = createAsyncThunk('currency/fetchCurrencies', async searchParams => {
  return (await api(`currency/?${searchParams}`)).data;
});

export const fetchCurrencyOne = createAsyncThunk('currency/fetchCurrency', async id => {
  return (await api(`currency/${id}/`)).data;
});

export const createCurrency = createAsyncThunk(
  'currency/createCurrency',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post('currency/create/', body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updateCurrency = createAsyncThunk(
  'currency/updateCurrency',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.put(`currency/update/${id}/`, values);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deleteCurrency = createAsyncThunk(
  'currency/deleteCurrency',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`currency/delete/${id}/`);
    dispatch(fetchCurrencies(searchParams));
    dispatch(fetchAllCurrencies());
  }
);

export const fetchRates = createAsyncThunk('currency/fetchRates', async id => {
  return (await api(`country/${id}/exchange-rate/`)).data;
});

export const editRate = createAsyncThunk(
  'currency/editRate',
  async (values, { rejectWithValue }) => {
    try {
      await api.post('exchange-rate/create/', { ...values, selling_rate: 0 });
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const fetchExchangeRaresByCountry = createAsyncThunk(
  'currency/fetchExchangeRaresByCountry',
  async country => {
    return (await api(`exchange-rate/${country ? `?country=${country}` : ''}`)).data;
  }
);
