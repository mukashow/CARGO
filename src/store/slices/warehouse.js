import { createSlice } from '@reduxjs/toolkit';
import {
  fetchActAcceptanceOrdering,
  fetchClientsDirectionList,
  fetchGoodsAcceptanceActList,
  fetchWarehouseList,
  fetchRouteList,
  fetchContainersList,
  fetchWarehouses,
  fetchWarehouse,
} from '@actions/warehouse';

const getLocalStorage = cb => {
  try {
    return cb();
  } catch (e) {
    return null;
  }
};

const initialState = {
  clientDirectionList: [],
  warehouseList: null,
  orders: null,
  acts: null,
  routeList: null,
  containersList: null,
  visibleWarehouses: {
    actual: getLocalStorage(() => JSON.parse(localStorage.getItem('visibleWarehouses'))),
    init: getLocalStorage(() => JSON.parse(localStorage.getItem('visibleWarehousesInit'))),
  },
  hiddenWarehouses: {
    actual: getLocalStorage(() => JSON.parse(localStorage.getItem('hiddenWarehouses'))),
    init: getLocalStorage(() => JSON.parse(localStorage.getItem('hiddenWarehousesInit'))),
  },
  dimensions: {
    actual: getLocalStorage(() => JSON.parse(localStorage.getItem('warehouseDimensions'))),
    init: getLocalStorage(() => JSON.parse(localStorage.getItem('warehouseDimensionsInit'))),
  },
  warehouses: null,
  warehouse: null,
};

export const warehouse = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    setVisibleWarehouses: (state, { payload }) => {
      localStorage.setItem('visibleWarehouses', JSON.stringify(payload));
      state.visibleWarehouses.actual = payload;
      if (!state.visibleWarehouses.init) {
        state.visibleWarehouses.init = payload;
        localStorage.setItem('visibleWarehousesInit', JSON.stringify(payload));
      }
    },
    setHiddenWarehouses: (state, { payload }) => {
      localStorage.setItem('hiddenWarehouses', JSON.stringify(payload));
      state.hiddenWarehouses.actual = payload;
      if (!state.hiddenWarehouses.init) {
        state.hiddenWarehouses.init = payload;
        localStorage.setItem('hiddenWarehousesInit', JSON.stringify(payload));
      }
    },
    setInitVisibleWarehouses: (state, { payload }) => {
      localStorage.setItem('visibleWarehousesInit', JSON.stringify(payload));
      state.visibleWarehouses.init = payload;
    },
    setInitHiddenWarehouses: (state, { payload }) => {
      localStorage.setItem('hiddenWarehousesInit', JSON.stringify(payload));
      state.hiddenWarehouses.init = payload;
    },
    resetWarehouseOrder: state => {
      state.visibleWarehouses.actual = state.visibleWarehouses.init;
      state.hiddenWarehouses.actual = state.hiddenWarehouses.init;
      state.dimensions.actual = state.dimensions.init;
      localStorage.setItem('visibleWarehouses', JSON.stringify(state.visibleWarehouses.init));
      localStorage.setItem('hiddenWarehouses', JSON.stringify(state.hiddenWarehouses.init));
      localStorage.setItem('warehouseDimensions', JSON.stringify(state.dimensions.init));
    },
    setDimensions: (state, { payload }) => {
      state.dimensions.actual = payload;
      localStorage.setItem('warehouseDimensions', JSON.stringify(payload));
    },
    setDimensionsInit: (state, { payload }) => {
      state.dimensions.init = payload;
      localStorage.setItem('warehouseDimensionsInit', JSON.stringify(payload));
    },
  },
  extraReducers: {
    [fetchClientsDirectionList.fulfilled]: (state, { payload }) => {
      state.clientDirectionList = payload;
    },
    [fetchWarehouseList.fulfilled]: (state, { payload }) => {
      state.warehouseList = payload;
    },
    [fetchActAcceptanceOrdering.fulfilled]: (state, { payload }) => {
      state.orders = payload;
    },
    [fetchGoodsAcceptanceActList.fulfilled]: (state, { payload }) => {
      state.acts = payload;
    },
    [fetchRouteList.fulfilled]: (state, { payload }) => {
      state.routeList = payload;
    },
    [fetchContainersList.fulfilled]: (state, { payload }) => {
      state.containersList = payload;
    },
    [fetchWarehouses.fulfilled]: (state, { payload }) => {
      state.warehouses = payload;
    },
    [fetchWarehouse.fulfilled]: (state, { payload }) => {
      state.warehouse = payload;
    },
  },
});

export const {
  setVisibleWarehouses,
  setHiddenWarehouses,
  resetWarehouseOrder,
  setInitHiddenWarehouses,
  setInitVisibleWarehouses,
  setDimensions,
  setDimensionsInit,
} = warehouse.actions;

export default warehouse.reducer;
