import { createSlice } from '@reduxjs/toolkit';
import {
  fetchClientDocProcessingFees,
  fetchClientDocTariff,
  fetchCustomClearanceTariffDetail,
  fetchCustomClearanceTariffGoodsType,
  fetchCustomClearanceTariffOrders,
  fetchCustomClearanceTariffs,
  fetchDocProcessingFees,
  fetchDocTariffOrders,
  fetchTransportationTariff,
} from '@actions/tariff';

const initialState = {
  customClearanceTariffs: null,
  customClearanceTariff: null,
  customClearanceTariffOrders: null,
  goodsType: null,
  docTariffOrders: null,
  clientDocProcFee: null,
  clientDocFee: null,
  docProcFee: null,
  transportationTariff: null,
};

export const tariff = createSlice({
  name: 'tariff',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchCustomClearanceTariffs.fulfilled]: (state, { payload }) => {
      state.customClearanceTariffs = payload;
    },
    [fetchCustomClearanceTariffGoodsType.fulfilled]: (state, { payload }) => {
      state.goodsType = payload;
    },
    [fetchCustomClearanceTariffDetail.fulfilled]: (state, { payload }) => {
      state.customClearanceTariff = payload;
    },
    [fetchDocTariffOrders.fulfilled]: (state, { payload }) => {
      state.docTariffOrders = payload;
    },
    [fetchCustomClearanceTariffOrders.fulfilled]: (state, { payload }) => {
      state.customClearanceTariffOrders = payload;
    },
    [fetchTransportationTariff.fulfilled]: (state, { payload }) => {
      state.transportationTariff = payload;
    },
    [fetchClientDocProcessingFees.fulfilled]: (state, { payload }) => {
      state.clientDocProcFee = payload;
    },
    [fetchDocProcessingFees.fulfilled]: (state, { payload }) => {
      state.docProcFee = payload;
    },
    [fetchDocProcessingFees.rejected]: state => {
      state.docProcFee = null;
    },
    [fetchClientDocTariff.fulfilled]: (state, { payload }) => {
      state.clientDocFee = payload;
    },
  },
});

export default tariff.reducer;
