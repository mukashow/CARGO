import { createSlice } from '@reduxjs/toolkit';
import { signIn } from '@actions/auth';
import { NAVIGATION_BY_ROLES } from '@/constants';

const initialState = {
  navigation: NAVIGATION_BY_ROLES,
  user: {
    refresh: localStorage.getItem('cargoRefreshToken'),
    access: localStorage.getItem('cargoToken'),
    role_id: Number(localStorage.getItem('cargoRoleId')),
    role_name: localStorage.getItem('cargoRoleName'),
    name: localStorage.getItem('cargoName'),
    last_name: localStorage.getItem('cargoLastName'),
    otchestvo: localStorage.getItem('cargoOtchestvo'),
    has_storekeeper_permissions: localStorage.getItem('hasStorekeeperPermissions') === 'true',
    has_cashier_permissions: localStorage.getItem('hasCashierPermissions') === 'true',
  },
};

export const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut: state => {
      state.user = {
        refresh: null,
        access: null,
        role_id: null,
        role_name: null,
        name: null,
        last_name: null,
        otchestvo: null,
        has_storekeeper_permissions: null,
        exited: true,
      };
      localStorage.removeItem('cargoRefreshToken');
      localStorage.removeItem('cargoToken');
      localStorage.removeItem('cargoRoleId');
      localStorage.removeItem('cargoRoleName');
      localStorage.removeItem('cargoName');
      localStorage.removeItem('cargoLastName');
      localStorage.removeItem('cargoOtchestvo');
      localStorage.removeItem('hasStorekeeperPermissions');
      localStorage.removeItem('hasCashierPermissions');
      localStorage.removeItem('visibleWarehouses');
      localStorage.removeItem('visibleWarehousesInit');
      localStorage.removeItem('hiddenWarehouses');
      localStorage.removeItem('hiddenWarehousesInit');
      localStorage.removeItem('warehouseDimensions');
      localStorage.removeItem('warehouseDimensionsInit');
    },
  },
  extraReducers: {
    [signIn.fulfilled]: (state, { payload }) => {
      state.user = payload;
    },
  },
});

export const { signOut } = auth.actions;

export default auth.reducer;
