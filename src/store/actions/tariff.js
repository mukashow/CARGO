import api, { uninterceptedAxiosInstance } from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTransportationTariffs } from '@actions/point';

export const fetchCustomClearanceTariffs = createAsyncThunk(
  'tariff/fetchCustomClearanceTariffs',
  async searchParams => {
    return (await api(`custom-clearance-tariff/?${searchParams}`)).data;
  }
);

export const fetchCustomClearanceTariffOrders = createAsyncThunk(
  'tariff/fetchCustomClearanceTariffOrders',
  async () => {
    return (await api('custom-clearance-tariff/ordering-fields/')).data;
  }
);

export const fetchCustomClearanceTariffGoodsType = createAsyncThunk(
  'tariff/fetchCustomClearanceTariffGoodsType',
  async () => {
    return (await api('goods-type/id-name/?no_pagination=true')).data;
  }
);

export const createCustomClearanceTariff = createAsyncThunk(
  'tariff/createCustomClearanceTariff',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key] !== null && typeof values[key] === 'object') {
          body[key] = values[key].value;
        } else {
          body[key] = values[key] || 0;
        }
      }
      await api.post('custom-clearance-tariff/create/', body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const fetchCustomClearanceTariffDetail = createAsyncThunk(
  'tariff/fetchCustomClearanceTariffDetail',
  async id => {
    return (await api(`custom-clearance-tariff/${id}/`)).data;
  }
);

export const deleteCustomClearanceTariff = createAsyncThunk(
  'tariff/deleteCustomClearanceTariff',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`custom-clearance-tariff/${id}/delete/`);
    dispatch(fetchCustomClearanceTariffs(searchParams));
  }
);

export const fetchDocProcessingFees = createAsyncThunk(
  'tariff/fetchDocProcessingFees',
  async searchParams => {
    return (
      await uninterceptedAxiosInstance(
        `document-tariff/country-transportation-type/?${searchParams}`
      )
    ).data;
  }
);

export const fetchClientDocProcessingFees = createAsyncThunk(
  'tariff/fetchClientDocProcessingFees',
  async searchParams => {
    return (await api(`document-tariff/?${searchParams}`)).data;
  }
);

export const fetchDocTariffOrders = createAsyncThunk('tariff/fetchDocTariffOrders', async () => {
  return (await api('document-tariff/ordering-fields/')).data;
});

export const fetchClientDocTariff = createAsyncThunk(
  'tariff/fetchClientDocTariff',
  async ({ id, client_code }) => {
    const { data } = await api(`document-tariff/${id}/`);
    return { ...data, client_code };
  }
);

export const createDocProcessingFee = createAsyncThunk(
  'tariff/createDocProcessingFee',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object' && values[key] !== null) {
            body[key] = values[key].value;
          } else {
            body[key] = values[key];
          }
        }
      }
      return (await api.post('document-tariff/create/', body)).data;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deleteDocProcessingFee = createAsyncThunk(
  'tariff/deleteDocProcessingFee',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`document-tariff/${id}/delete/`);
    dispatch(fetchClientDocProcessingFees(searchParams));
    dispatch(fetchDocProcessingFees(searchParams));
  }
);

export const createTransportationTariff = createAsyncThunk(
  'tariff/createTransportationTariff',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key] !== null && values[key] !== '') {
          if (typeof values[key] === 'object') {
            body[key] = values[key].value;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.post('transportation-tariff/create/', body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updateTransportationTariff = createAsyncThunk(
  'tariff/updateTransportationTariff',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (typeof values[key] === 'object' && values[key] !== null) {
          body[key] = values[key].value;
        } else {
          body[key] = values[key] || 0;
        }
      }
      await api.post('transportation-tariff/create/', body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deleteTransportationTariff = createAsyncThunk(
  'tariff/deleteTransportationTariff',
  async ({ id, directionId, transportationTypeId }, { dispatch }) => {
    await api.delete(`transportation-tariff/${id}/delete/`);
    await dispatch(
      fetchTransportationTariffs(
        `transportation_type_id=${transportationTypeId}&direction_id=${directionId}`
      )
    );
  }
);

export const fetchTransportationTariff = createAsyncThunk(
  'tariff/fetchTransportationTariff',
  async id => {
    return (await api(`transportation-tariff/${id}/`)).data;
  }
);

export const fetchGoodsTariffCalculation = createAsyncThunk(
  'tariff/fetchGoodsTariffCalculation',
  async ({ id, tnved }) => {
    return (await api(`goods-acceptance/${id}/tnved/${tnved}/calculation/`)).data;
  }
);
