import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllContainersState,
  fetchContainerStateOne,
  fetchContainersState,
  fetchContainerOwnershipType,
  fetchContainerOne,
  fetchWarehousesForReturn,
  fetchContainerCustomType,
  fetchContainerStatuses,
  fetchContainerInWayFromWarehouses,
  fetchContainerInWayToWarehouses,
  fetchContainerOrders,
  fetchContainers,
} from '@/store/actions';

const initialState = {
  containersState: null,
  containerStateOne: null,
  allContainers: null,
  ownershipType: null,
  containerOne: null,
  warehousesForReturn: null,
  customsTypes: null,
  statuses: null,
  warehouseInWayFrom: null,
  warehouseInWayTo: null,
  orders: null,
  containers: null,
};

export const container = createSlice({
  name: 'container',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchContainersState.fulfilled]: (state, { payload }) => {
      state.containersState = payload;
    },
    [fetchAllContainersState.fulfilled]: (state, { payload }) => {
      state.allContainersState = payload;
    },
    [fetchContainerStateOne.fulfilled]: (state, { payload }) => {
      state.containerStateOne = payload;
    },
    [fetchContainerOwnershipType.fulfilled]: (state, { payload }) => {
      state.ownershipType = payload;
    },
    [fetchContainerOne.fulfilled]: (state, { payload }) => {
      state.containerOne = payload;
    },
    [fetchWarehousesForReturn.fulfilled]: (state, { payload }) => {
      state.warehousesForReturn = payload;
    },
    [fetchContainerCustomType.fulfilled]: (state, { payload }) => {
      state.customsTypes = payload.map(({ name, state }) => ({ id: state, name }));
    },
    [fetchContainerStatuses.fulfilled]: (state, { payload }) => {
      state.statuses = payload;
    },
    [fetchContainerInWayFromWarehouses.fulfilled]: (state, { payload }) => {
      state.warehouseInWayFrom = payload;
    },
    [fetchContainerInWayToWarehouses.fulfilled]: (state, { payload }) => {
      state.warehouseInWayTo = payload;
    },
    [fetchContainerOrders.fulfilled]: (state, { payload }) => {
      state.orders = payload.map(({ key, value }) => ({ id: key, name: value }));
    },
    [fetchContainers.fulfilled]: (state, { payload }) => {
      state.containers = payload;
    },
  },
});

export const {} = container.actions;

export default container.reducer;
