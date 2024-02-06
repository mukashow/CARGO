import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAcceptedActs,
  fetchAcceptedActsOrders,
  fetchAwaitingInventoryActs,
  fetchAwaitingInventoryActsOrders,
  fetchFilterDirectionList,
  fetchFilterGoodsType,
  fetchFilterStatusList,
  fetchFilterTagList,
  fetchGoodsType,
  fetchGoodsTypeTnved,
  fetchGoodsTypeWithTnved,
  fetchManagerGoodsAcceptanceInfo,
  fetchPlacesByTnved,
  fetchStorekeeperGoodsAcceptanceInfo,
} from '@actions/goods';

const initialState = {
  goodsDetail: null,
  goodsTypeWithTnved: null,
  placesByTnved: null,
  filterDirectionList: null,
  filterGoodsType: null,
  filterTagList: null,
  filterStatusList: null,
  awaitingInventoryActs: null,
  awaitingInventoryOrders: null,
  acceptedActs: null,
  acceptedOrders: null,
  goodsTypes: null,
};

export const goods = createSlice({
  name: 'goods',
  initialState,
  reducers: {
    setGoodsDetail: (state, { payload }) => {
      state.goodsDetail = payload;
    },
  },
  extraReducers: {
    [fetchManagerGoodsAcceptanceInfo.fulfilled]: (state, { payload }) => {
      state.goodsDetail = payload;
    },
    [fetchStorekeeperGoodsAcceptanceInfo.fulfilled]: (state, { payload }) => {
      state.goodsDetail = payload;
    },
    [fetchGoodsTypeWithTnved.fulfilled]: (state, { payload }) => {
      state.goodsTypeWithTnved = payload;
    },
    [fetchPlacesByTnved.fulfilled]: (state, { payload }) => {
      state.placesByTnved = payload;
    },
    [fetchFilterDirectionList.fulfilled]: (state, { payload }) => {
      state.filterDirectionList = payload;
    },
    [fetchFilterGoodsType.fulfilled]: (state, { payload }) => {
      state.filterGoodsType = payload;
    },
    [fetchFilterTagList.fulfilled]: (state, { payload }) => {
      state.filterTagList = payload;
    },
    [fetchFilterStatusList.fulfilled]: (state, { payload }) => {
      state.filterStatusList = payload;
    },
    [fetchAwaitingInventoryActs.fulfilled]: (state, { payload }) => {
      state.awaitingInventoryActs = payload;
    },
    [fetchAwaitingInventoryActsOrders.fulfilled]: (state, { payload }) => {
      state.awaitingInventoryOrders = payload;
    },
    [fetchAcceptedActsOrders.fulfilled]: (state, { payload }) => {
      state.acceptedOrders = payload;
    },
    [fetchAcceptedActs.fulfilled]: (state, { payload }) => {
      state.acceptedActs = payload;
    },
    [fetchGoodsType.fulfilled]: (state, { payload }) => {
      state.goodsTypes = payload;
    },
    [fetchGoodsTypeTnved.fulfilled]: (state, { payload }) => {
      const foundGoodsType = state.goodsTypes.results.find(({ id }) => id === payload.id);
      if (foundGoodsType) {
        foundGoodsType.tnved = payload.data;
      }
    },
  },
});

export const { setGoodsDetail } = goods.actions;

export default goods.reducer;
