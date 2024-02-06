import api, { uninterceptedAxiosInstance } from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

export const fetchContainersState = createAsyncThunk(
  'container/fetchContainersState',
  async searchParams => {
    return (await api(`container-state/?${searchParams}`)).data;
  }
);

export const fetchContainerStateOne = createAsyncThunk(
  'container/fetchContainerStateOne',
  async id => {
    return (await api(`container-state/${id}/`)).data;
  }
);

export const fetchAllContainersState = createAsyncThunk(
  'container/fetchAllContainersState',
  async () => {
    return (await api('container-state/?no_pagination=true')).data;
  }
);

export const createContainerState = createAsyncThunk(
  'container/createContainerState',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (!values[key]) continue;
        body[key] = values[key];
      }
      await api.post('container-state/create/', body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updateContainerState = createAsyncThunk(
  'container/updateContainerState',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (!values[key]) continue;
        body[key] = values[key];
      }
      await api.put(`container-state/update/${id}/`, body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deleteContainerState = createAsyncThunk(
  'container/deleteContainerState',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`container-state/delete/${id}/`);
    dispatch(fetchContainersState(searchParams));
    dispatch(fetchAllContainersState());
  }
);

export const fetchContainerOwnershipType = createAsyncThunk(
  'container/fetchOwnershipType',
  async () => {
    return (await api('container/property-type/')).data;
  }
);

export const fetchContainerOne = createAsyncThunk(
  'container/fetchContainerOne',
  async (id, { rejectWithValue }) => {
    try {
      return (await uninterceptedAxiosInstance(`container/${id}/`)).data;
    } catch (e) {
      return rejectWithValue(e.response.status);
    }
  }
);

export const fetchContainerDocuments = createAsyncThunk(
  'container/fetchContainerDocuments',
  async id => {
    return (await api(`container/${id}/dependent-document-list/`)).data;
  }
);

export const createContainer = createAsyncThunk(
  'container/createContainer',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        const data = values[key];
        if (!data) continue;
        if (typeof data === 'object') {
          if (typeof data.getMonth === 'function') {
            body[key] = dayjs(data).format('DD.MM.YYYY');
            continue;
          }
          body[key] = data.id;
          continue;
        }
        body[key] = data;
      }
      const data = (await api.post('container/create/', body)).data;
      return data.id;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updateContainer = createAsyncThunk(
  'container/updateContainer',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        const data = values[key];
        if (!data) continue;
        if (typeof data === 'object') {
          if (typeof data.getMonth === 'function') {
            body[key] = dayjs(data).format('DD.MM.YYYY');
            continue;
          }
          body[key] = data.id;
          continue;
        }
        body[key] = data;
      }
      const data = (await api.put(`container/${id}/update/`, body)).data;
      return data.id;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deleteContainer = createAsyncThunk('container/deleteContainer', async id => {
  await api.delete(`container/${id}/delete/`);
});

export const fetchWarehousesForReturn = createAsyncThunk(
  'container/fetchWarehousesForReturn',
  async (_, { getState }) => {
    const role = getState().auth.user.role_id;
    return (await api(`${role === 1 ? 'warehouse/' : ''}container/return_warehouse/`)).data;
  }
);

export const fetchContainersByQuery = async q => {
  const { data } = await api(`container/search-list/?number=${q}`);
  return data.map(({ number }) => ({ id: number, name: number }));
};

export const fetchContainerCustomType = createAsyncThunk(
  'container/fetchContainerCustomType',
  async () => {
    return (await api('container/custom-clearance-type/')).data;
  }
);

export const fetchContainerStatuses = createAsyncThunk(
  'container/fetchContainerStatuses',
  async () => {
    return (await api('container/status/')).data;
  }
);

export const fetchContainerOrders = createAsyncThunk('container/fetchContainerOrders', async () => {
  return (await api('warehouse/container/ordering-fields/')).data;
});

export const fetchContainerInWayFromWarehouses = createAsyncThunk(
  'container/fetchContainerInWayFromWarehouses',
  async (_, { getState }) => {
    const role = getState().auth.user.role_id;
    return (await api(`${role === 1 ? 'warehouse/' : ''}container/warehouse_from/`)).data;
  }
);

export const fetchContainerInWayToWarehouses = createAsyncThunk(
  'container/fetchContainerInWayToWarehouses',
  async (_, { getState }) => {
    const role = getState().auth.user.role_id;
    return (await api(`${role === 1 ? 'warehouse/' : ''}container/warehouse_to/`)).data;
  }
);

export const fetchContainers = createAsyncThunk(
  'container/fetchContainers',
  async ({ searchParams, id }, { getState }) => {
    const role = getState().auth.user.role_id;
    let url = `warehouse/container/?${searchParams}`;
    if (role === 5) {
      if (id) {
        url = `warehouse/${id}/container/?${searchParams}`;
      } else {
        url = `container/?${searchParams}`;
      }
    }
    return (await api(url)).data;
  }
);

export const fetchAllContainerDocumentTypes = createAsyncThunk(
  'container/fetchAllContainerDocumentTypes',
  async id => {
    return (await api(`container/${id}/document-type/?no_pagination=true`)).data;
  }
);

export const addDocumentToContainer = createAsyncThunk(
  'container/addDocumentToContainer',
  async ({ docId, doc_type, comment }, { dispatch }) => {
    try {
      const id = (
        await api.post(`container/${docId}/add-document/`, {
          doc_type: doc_type.value,
          comment: comment || null,
        })
      ).data.id;
      dispatch(fetchContainerOne(docId));
      return id;
    } catch (e) {
      console.log(e);
    }
  }
);
