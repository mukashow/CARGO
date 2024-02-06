import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchClientsDirectionList = createAsyncThunk(
  'warehouse/fetchDirectionList',
  async ({ id, warehouse }) => {
    const { data } = await api(
      `warehouse-client-direction-list/${warehouse ? `${warehouse}/` : ''}?client=${id}`
    );
    return data.map(({ id, name }) => ({ label: name, value: id }));
  }
);

export const fetchWarehouseList = createAsyncThunk('warehouse/fetchWarehousesList', async () => {
  return (await api.get('warehouse-id-name/')).data;
});

export const fetchActAcceptanceOrdering = createAsyncThunk(
  'warehouse/fetchActAcceptanceOrdering',
  async () => {
    return (await api.get('warehouse/goods-acceptance/ordering-fields/')).data;
  }
);

export const fetchGoodsAcceptanceActList = createAsyncThunk(
  'warehouse/fetchGoodsAcceptanceActList',
  async ({ id, searchParams }, { getState }) => {
    const roleId = getState().auth.user.role_id;

    if (roleId === 5 && !id) {
      return (await api.get(`goods-acceptance/?${searchParams}`)).data;
    }
    return (await api.get(`warehouse${id ? `/${id}` : ''}/goods-acceptance/?${searchParams}`)).data;
  }
);

export const fetchRouteList = createAsyncThunk(
  'loadingList/fetchManagerRouteList',
  async (id, { getState }) => {
    const roleId = getState().auth.user.role_id;
    const { data } = await api(
      roleId === 5 ? `warehouse/${id}/route-list/` : 'manager/route-list/'
    );
    return data.map(({ id, name }) => ({ value: id, label: name }));
  }
);

export const fetchContainersList = createAsyncThunk(
  'warehouse/fetchContainersList',
  async (id, { getState }) => {
    const roleId = getState().auth.user.role_id;
    const { data } = await api(`warehouse${roleId === 5 ? `/${id}` : ''}/container/short/`);
    return data.map(({ id, number, property_type }) => ({
      value: id,
      label: number,
      property_type,
    }));
  }
);

export const fetchWarehouses = createAsyncThunk('warehouse/fetchWarehouses', async searchParams => {
  return (await api(`warehouse/?${searchParams}`)).data;
});

export const fetchWarehouse = createAsyncThunk('warehouse/fetchWarehouse', async id => {
  return (await api(`warehouse/${id}/`)).data;
});

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async ({ values, searchParams }, { rejectWithValue, dispatch }) => {
    try {
      const body = {};
      for (const key in values) {
        if (key !== 'country') {
          if (typeof values[key] === 'object' && values[key] !== null) {
            if (Array.isArray(values[key])) {
              const items = values[key].filter(value => !!value).map(({ value }) => value);
              if (items.length) body[key] = items;
            } else {
              body[key] = values[key].value;
            }
          } else if (values[key]) body[key] = values[key];
        }
      }
      await api.post('warehouse/create/', body);
      dispatch(fetchWarehouses(searchParams));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, values, searchParams }, { rejectWithValue, dispatch, getState }) => {
    try {
      const warehouse = getState().warehouse.warehouse;
      const body = {};
      for (const key in values) {
        if (key !== 'country') {
          if (values[key] === null) {
            if (warehouse[key] !== values[key]) body[key] = values[key];
          } else if (typeof values[key] === 'object') {
            if (Array.isArray(values[key])) {
              body[key] = values[key].filter(value => !!value).map(({ value }) => value);
            } else {
              body[key] = values[key].value;
            }
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.put(`warehouse/update/${id}/`, body);
      dispatch(fetchWarehouses(searchParams));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const deleteWarehouses = createAsyncThunk(
  'warehouse/deleteWarehouses',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`warehouse/delete/${id}`);
    dispatch(fetchWarehouses(searchParams));
  }
);
