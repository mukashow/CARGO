import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAwaitingCustomClearanceLoadingList,
  fetchAwaitingCustomClearanceLoadingListGoodsType,
  fetchAwaitingCustomClearanceLoadingListOrders,
  fetchAwaitingCustomClearanceLoadingListRoutes,
  fetchGoodsForUnloading,
  fetchGoodsToAddOrders,
  fetchGoodsToAddToLoadingList,
  fetchLoadingList,
  fetchLoadingListGoodsType,
  fetchLoadingListInfo,
  fetchLoadingListOrders,
  fetchLoadingListPlaces,
  fetchLoadingListRoutes,
  fetchLoadingListStatus,
  fetchLoadingTasks,
  fetchLoadingTasksOrders,
  fetchLoadingTasksRoutes,
  fetchScannedPlaces,
  fetchTasksForUnloading,
  fetchUnloadingTasksOrders,
  fetchUnloadingTasksRoutes,
} from '@actions/loadingList';

const initialState = {
  loadingListDetail: null,
  orders: null,
  goodsToAddOrders: null,
  loadingList: null,
  goodsToAdd: null,
  filterDirectionList: null,
  filterGoodsType: null,
  filterStatusList: null,
  places: null,
  loadingTasks: null,
  loadingTasksRoutes: null,
  loadingTasksOrders: null,
  scannedPlaces: null,
  awaitingClearanceLoadingList: {
    loadingList: null,
    routes: null,
    goodsType: null,
    orders: null,
  },
  unloadingGoods: null,
  tasksForUnloading: null,
  unloadingTasksRoutes: null,
};

export const loadingList = createSlice({
  name: 'loadingList',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchLoadingListInfo.fulfilled]: (state, { payload }) => {
      state.loadingListDetail = payload;
    },
    [fetchLoadingListOrders.fulfilled]: (state, { payload }) => {
      state.orders = payload;
    },
    [fetchLoadingListRoutes.fulfilled]: (state, { payload }) => {
      state.filterDirectionList = payload;
    },
    [fetchLoadingListGoodsType.fulfilled]: (state, { payload }) => {
      state.filterGoodsType = payload;
    },
    [fetchLoadingListStatus.fulfilled]: (state, { payload }) => {
      state.filterStatusList = payload;
    },
    [fetchLoadingList.fulfilled]: (state, { payload }) => {
      state.loadingList = payload;
    },
    [fetchGoodsToAddOrders.fulfilled]: (state, { payload }) => {
      state.goodsToAddOrders = payload;
    },
    [fetchGoodsToAddToLoadingList.fulfilled]: (state, { payload }) => {
      state.goodsToAdd = payload;
    },
    [fetchLoadingListPlaces.fulfilled]: (state, { payload }) => {
      state.places = payload;
    },
    [fetchLoadingTasksRoutes.fulfilled]: (state, { payload }) => {
      state.loadingTasksRoutes = payload;
    },
    [fetchLoadingTasksOrders.fulfilled]: (state, { payload }) => {
      state.loadingTasksOrders = payload;
    },
    [fetchLoadingTasks.fulfilled]: (state, { payload }) => {
      state.loadingTasks = payload;
    },
    [fetchScannedPlaces.fulfilled]: (state, { payload }) => {
      state.scannedPlaces = payload;
    },
    [fetchGoodsForUnloading.fulfilled]: (state, { payload }) => {
      state.unloadingGoods = payload;
    },
    [fetchAwaitingCustomClearanceLoadingList.fulfilled]: (state, { payload }) => {
      state.awaitingClearanceLoadingList.loadingList = payload;
    },
    [fetchAwaitingCustomClearanceLoadingListRoutes.fulfilled]: (state, { payload }) => {
      state.awaitingClearanceLoadingList.routes = payload;
    },
    [fetchAwaitingCustomClearanceLoadingListGoodsType.fulfilled]: (state, { payload }) => {
      state.awaitingClearanceLoadingList.goodsType = payload;
    },
    [fetchAwaitingCustomClearanceLoadingListOrders.fulfilled]: (state, { payload }) => {
      state.awaitingClearanceLoadingList.orders = payload;
    },
    [fetchTasksForUnloading.fulfilled]: (state, { payload }) => {
      state.tasksForUnloading = payload;
    },
    [fetchUnloadingTasksOrders.fulfilled]: (state, { payload }) => {
      state.unloadingTasksOrders = payload;
    },
    [fetchUnloadingTasksRoutes.fulfilled]: (state, { payload }) => {
      state.unloadingTasksRoutes = payload;
    },
  },
});

export const {} = loadingList.actions;

export default loadingList.reducer;
