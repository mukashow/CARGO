import { createSlice } from '@reduxjs/toolkit';
import {
  fetchClient,
  fetchClientCode,
  fetchClientContractType,
  fetchClientInfoByCode,
  fetchClientOrders,
  fetchClients,
  fetchUserDocuments,
  fetchDocumentDocuments,
  fetchContainerDocuments,
} from '@actions';

const initialState = {
  clients: null,
  filters: {
    orders: null,
    codes: null,
  },
  client: null,
  clientContractType: [],
  clientInfo: {
    receiver: null,
    sender: null,
  },
  documents: null,
};

export const clients = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchClients.fulfilled]: (state, { payload }) => {
      state.clients = payload;
    },
    [fetchClient.fulfilled]: (state, { payload }) => {
      state.client = payload;
    },
    [fetchClientOrders.fulfilled]: (state, { payload }) => {
      state.filters.orders = payload;
    },
    [fetchClientCode.fulfilled]: (state, { payload }) => {
      state.filters.codes = payload;
    },
    [fetchClientContractType.fulfilled]: (state, { payload }) => {
      state.clientContractType = payload;
    },
    [fetchClientInfoByCode.fulfilled]: (state, { payload }) => {
      state.clientInfo[payload.type] = payload.data;
    },
    [fetchUserDocuments.fulfilled]: (state, { payload }) => {
      state.documents = payload;
    },
    [fetchDocumentDocuments.fulfilled]: (state, { payload }) => {
      state.documents = payload;
    },
    [fetchContainerDocuments.fulfilled]: (state, { payload }) => {
      state.documents = payload;
    },
  },
});

export const {} = clients.actions;

export default clients.reducer;
