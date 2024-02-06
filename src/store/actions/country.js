import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCodeAndPassword = createAsyncThunk(
  'country/fetchCodeAndPassword',
  async ({ id, setValue }) => {
    const { data } = await api.get(`client/new-password-and-code/?country_id=${id}`);
    setValue('code', data.code);
    setValue('password', data.password);
    return data;
  }
);

export const fetchCities = createAsyncThunk('country/fetchCities', async () => {
  return (await api.get('city/')).data;
});

export const fetchCityDetail = createAsyncThunk('country/fetchCityDetail', async id => {
  return (await api.get(`city/${id}/`)).data;
});

export const fetchCountries = createAsyncThunk('country/fetchCountries', async searchParams => {
  return (await api.get(`country/?${searchParams}`)).data;
});

export const fetchCountry = createAsyncThunk('country/fetchCountry', async id => {
  return (await api.get(`country/${id}/`)).data;
});

export const fetchCountryCities = createAsyncThunk(
  'country/fetchCountryCities',
  async ({ id, name }) => {
    const { data } = await api.get(`city/?country_name=${name}`);
    return { id, data };
  }
);

export const fetchCountryCitiesByParams = createAsyncThunk(
  'country/fetchCountryCitiesById',
  async params => {
    return (await api(`city/?${params}`)).data;
  }
);

export const createCountry = createAsyncThunk(
  'country/createCountry',
  async ({ values, searchParams }, { dispatch, rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post('country/create/', body);
      await dispatch(fetchCountries(searchParams));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateCountry = createAsyncThunk(
  'country/updateCountry',
  async ({ id, values, searchParams }, { dispatch, rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key] !== null) {
          if (values[key] === '') {
            body[key] = null;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.put(`country/update/${id}/`, body);
      await dispatch(fetchCountries(searchParams));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const deleteCountry = createAsyncThunk(
  'country/deleteCountry',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`country/delete/${id}/`);
    await dispatch(fetchCountries(searchParams));
  }
);

export const fetchCity = createAsyncThunk('country/fetchCity', async name => {
  return (await api.get(`city/?country_name=${name}`)).data;
});

export const createCity = createAsyncThunk(
  'country/createCity',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post('city/create/', { ...body, country: body.country.value });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateCity = createAsyncThunk(
  'country/updateCity',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key] !== null) body[key] = values[key];
      }
      await api.put(`city/update/${body.id}/`, { ...body, country: body.country.value });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const deleteCity = createAsyncThunk('country/deleteCity', async id => {
  await api.delete(`city/delete/${id}/`);
});

export const fetchManagerCountry = createAsyncThunk('country/fetchManagerCountry', async id => {
  return (await api('manager/country/')).data;
});
