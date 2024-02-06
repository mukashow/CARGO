import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCashiers,
  fetchManagers,
  fetchRoles,
  fetchStorekeepers,
  fetchPersonnel,
  fetchPersonnelDetail,
  fetchAvailableManagers,
  fetchAvailableManagersWithCurrentWarehouse,
  fetchAvailableCashiers,
  fetchAvailableCashiersWithCurrentWarehouse,
  fetchAvailableStorekeepers,
  fetchAvailableStorekeepersWithCurrentWarehouse,
  fetchAllPersonnel,
  fetchAllRoles,
} from '@actions/users';

const initialState = {
  managers: null,
  availableManagers: null,
  availableManagersWithCurrentWarehouse: null,
  cashiers: null,
  availableCashiers: null,
  availableCashiersWithCurrentWarehouse: null,
  storekeepers: null,
  availableStorekeepers: null,
  availableStorekeepersWithCurrentWarehouse: null,
  roles: null,
  allRoles: null,
  employees: null,
  employee: null,
  allEmployee: null,
};

export const users = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchManagers.fulfilled]: (state, { payload }) => {
      state.managers = payload;
    },
    [fetchAvailableManagers.fulfilled]: (state, { payload }) => {
      state.availableManagers = payload;
    },
    [fetchAvailableManagersWithCurrentWarehouse.fulfilled]: (state, { payload }) => {
      state.availableManagersWithCurrentWarehouse = payload;
    },
    [fetchCashiers.fulfilled]: (state, { payload }) => {
      state.cashiers = payload;
    },
    [fetchAvailableCashiers.fulfilled]: (state, { payload }) => {
      state.availableCashiers = payload;
    },
    [fetchAvailableCashiersWithCurrentWarehouse.fulfilled]: (state, { payload }) => {
      state.availableCashiersWithCurrentWarehouse = payload;
    },
    [fetchStorekeepers.fulfilled]: (state, { payload }) => {
      state.storekeepers = payload;
    },
    [fetchAvailableStorekeepers.fulfilled]: (state, { payload }) => {
      state.availableStorekeepers = payload;
    },
    [fetchAvailableStorekeepersWithCurrentWarehouse.fulfilled]: (state, { payload }) => {
      state.availableStorekeepersWithCurrentWarehouse = payload;
    },
    [fetchRoles.fulfilled]: (state, { payload }) => {
      state.roles = payload;
    },
    [fetchPersonnel.fulfilled]: (state, { payload }) => {
      state.employees = payload;
    },
    [fetchPersonnelDetail.fulfilled]: (state, { payload }) => {
      state.employee = payload;
    },
    [fetchAllPersonnel.fulfilled]: (state, { payload }) => {
      state.allEmployee = payload;
    },
    [fetchAllRoles.fulfilled]: (state, { payload }) => {
      state.allRoles = payload;
    },
  },
});

export const {} = users.actions;

export default users.reducer;
