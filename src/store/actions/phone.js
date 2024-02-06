import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getCreatePhone = async (clientId, data) => {
  const body = {};
  for (const key in data) {
    if (typeof data[key] === 'object') {
      body[key] = data[key].value;
    } else {
      body[key] = data[key];
    }
  }
  return await api.post(`client/${clientId}/phones/create/`, body);
};
export const getUpdatePhone = async (clientId, phoneId, data) => {
  const body = {};
  for (const key in data) {
    if (typeof data[key] === 'object') {
      body[key] = data[key].value;
    } else {
      body[key] = data[key];
    }
  }
  return await api.patch(`client/${clientId}/phones/update/${phoneId}/`, body);
};

export const getDeletePhone = async (clientId, phoneId) => {
  return await api.delete(`client/${clientId}/phones/delete/${phoneId}/`);
};

export const fetchPhoneCode = createAsyncThunk('phone/fetchPhoneCode', async () => {
  return (await api.get('country/id-name-code/')).data;
});

export const fetchPhoneType = createAsyncThunk('phone/fetchPhoneType', async () => {
  return (await api.get('phone-type/?no_pagination=true')).data;
});

export const fetchPhoneTypes = createAsyncThunk('phone/fetchPhoneTypes', async searchParams => {
  return (await api(`phone-type/?${searchParams}`)).data;
});

export const fetchPhoneTypeOne = createAsyncThunk('phone/fetchPhoneTypeOne', async id => {
  return (await api(`phone-type/${id}/`)).data;
});

export const fetchPhoneTypesFilter = createAsyncThunk('phone/fetchPhoneTypesFilter', async () => {
  return (await api('phone-type/id-name/')).data;
});

export const createPhoneType = createAsyncThunk(
  'phone/createPhoneType',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post(`phone-type/create/`, body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updatePhoneType = createAsyncThunk(
  'phone/updatePhoneType',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key] !== null) body[key] = values[key];
      }
      await api.put(`phone-type/${id}/update/`, body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deletePhoneType = createAsyncThunk(
  'phone/deletePhoneType',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`phone-type/${id}/delete/`);
    dispatch(fetchPhoneTypes(searchParams));
    dispatch(fetchPhoneTypesFilter());
    dispatch(fetchPhoneType());
  }
);
