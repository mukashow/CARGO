import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchManagers = createAsyncThunk('users/fetchManagers', async () => {
  return (await api('manager/')).data;
});

export const fetchAvailableManagers = createAsyncThunk('users/fetchAvailableManagers', async () => {
  return (await api('manager/?warehouse__isnull=true')).data;
});

export const fetchAvailableManagersWithCurrentWarehouse = createAsyncThunk(
  'users/fetchAvailableManagersWithCurrentWarehouse',
  async id => {
    return (await api(`manager/?warehouse__current_or_null=${id}`)).data;
  }
);

export const fetchCashiers = createAsyncThunk('users/fetchCashiers', async () => {
  return (await api('cashier/')).data;
});

export const fetchAvailableCashiers = createAsyncThunk('users/fetchAvailableCashiers', async () => {
  return (await api('cashier/?warehouse__isnull=true')).data;
});

export const fetchAvailableCashiersWithCurrentWarehouse = createAsyncThunk(
  'users/fetchAvailableCashiersWithCurrentWarehouse',
  async id => {
    return (await api(`cashier/?warehouse__current_or_null=${id}`)).data;
  }
);

export const fetchStorekeepers = createAsyncThunk('users/fetchStorekeepers', async () => {
  return (await api('storekeeper/')).data;
});

export const fetchAvailableStorekeepers = createAsyncThunk(
  'users/fetchAvailableStorekeepers',
  async () => {
    return (await api('storekeeper/?warehouse__isnull=true')).data;
  }
);

export const fetchAvailableStorekeepersWithCurrentWarehouse = createAsyncThunk(
  'users/fetchAvailableStorekeepersWithCurrentWarehouse',
  async id => {
    return (await api(`storekeeper/?warehouse__current_or_null=${id}`)).data;
  }
);

export const fetchRoles = createAsyncThunk('users/fetchRoles', async () => {
  return (await api('roles/')).data;
});

export const fetchAllRoles = createAsyncThunk('users/fetchAllRoles', async () => {
  return (await api('roles/all/')).data;
});

export const fetchPersonnel = createAsyncThunk(
  'users/fetchEmployees',
  async (searchParams, { getState }) => {
    const roleId = getState().auth.user.role_id;
    return (
      await api(roleId === 5 ? `worker/?${searchParams}` : `warehouse/worker/?${searchParams}`)
    ).data;
  }
);

export const fetchAllPersonnel = createAsyncThunk(
  'users/fetchAllPersonnel',
  async (searchParams, { getState }) => {
    const roleId = getState().auth.user.role_id;
    return (
      await api(
        roleId === 5 ? `worker/?no_pagination=true` : `warehouse/worker/?no_pagination=true`
      )
    ).data;
  }
);

export const fetchPersonnelDetail = createAsyncThunk('users/fetchPersonnelDetail', async id => {
  return (await api(`worker/${id}/`)).data;
});

export const createEmployee = createAsyncThunk(
  'users/createEmployee',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};

      for (const key in values) {
        if (values[key]) {
          if (Array.isArray(values[key])) {
            body[key] = values[key].map(item => {
              const obj = {};
              for (const itemKey in item) {
                if (typeof item[itemKey] === 'object') {
                  obj[itemKey] = item[itemKey].value;
                } else obj[itemKey] = item[itemKey];
              }
              return obj;
            });
          } else if (typeof values[key] === 'object' && values[key] !== null) {
            body[key] = values[key].value;
          } else {
            body[key] = values[key];
          }
        }
      }

      if (body.role === 4) {
        body.custom_clearance_country = body.country;
      }

      return await (
        await api.post('worker/create/', body)
      ).data;
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'users/updateEmployee',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};

      for (const key in values) {
        if (values[key] !== null) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].value;
          } else if (values[key] === '') {
            body[key] = null;
          } else {
            body[key] = values[key];
          }
        }
      }

      if (body.role === 4) {
        body.custom_clearance_country = body.country;
      }

      await api.put(`worker/update/${values.id}/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const addPersonnelPhone = createAsyncThunk(
  'users/addPersonnelPhone',
  async ({ id, country, number, phone_type }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`worker/${id}/phones/create/`, {
        country: country.value,
        number,
        phone_type: phone_type.value,
      });
      dispatch(fetchPersonnelDetail(id));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updatePersonnelPhone = createAsyncThunk(
  'users/updatePersonnelPhone',
  async ({ id, phoneId, country, number, phone_type }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`worker/${id}/phones/update/${phoneId}`, {
        country: country.value,
        number,
        phone_type: phone_type.value,
      });
      dispatch(fetchPersonnelDetail(id));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const deletePersonnelPhone = createAsyncThunk(
  'users/deletePersonnelPhone',
  async ({ id, phoneId }, { dispatch }) => {
    await api.delete(`worker/${id}/phones/delete/${phoneId}`);
    dispatch(fetchPersonnelDetail(id));
  }
);
