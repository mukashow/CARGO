import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { uninterceptedAxiosInstance } from '@/api';

export const fetchManagerGoodsAcceptanceInfo = createAsyncThunk(
  'goods/fetchManagerGoodsAcceptanceInfo',
  async ({ id, navigate }) => {
    try {
      return (await uninterceptedAxiosInstance(`manager/goods-acceptance/${id}/`)).data;
    } catch (e) {
      navigate?.('/warehouse?tab=acceptance_certificate&page=1&page_size=50');
    }
  }
);

export const fetchStorekeeperGoodsAcceptanceInfo = createAsyncThunk(
  'goods/fetchStorekeeperGoodsAcceptanceInfo',
  async ({ id, navigate }) => {
    try {
      return (await uninterceptedAxiosInstance(`storekeeper/goods-acceptance/${id}/`)).data;
    } catch (e) {
      navigate('/');
    }
  }
);

export const managerCreateGoodsAcceptanceAct = createAsyncThunk(
  'goods/managerCreateGoodsAcceptanceAct',
  async (values, { rejectWithValue }) => {
    try {
      const data = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object') {
            data[key] = values[key].value;
          } else {
            data[key] = values[key];
          }
        }
      }

      return (await api.post('/manager/goods-acceptance/create/', data)).data;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const storekeeperCreateGoodsAcceptanceAct = createAsyncThunk(
  'goods/storekeeperCreateGoodsAcceptanceAct',
  async (values, { rejectWithValue }) => {
    try {
      const data = {};
      for (const key in values) {
        if (values[key]) data[key] = values[key].value;
      }

      return (await api.post('storekeeper/goods-acceptance/create/', data)).data;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const goodsAcceptanceRefreshTariff = createAsyncThunk(
  'goods/managerGoodsAcceptanceRefreshTariff',
  async id => {
    await api.post('goods-acceptance/refresh-tariff/', { id });
  }
);

export const confirmGoodsAcceptance = createAsyncThunk('goods/goodsAcceptanceConfirm', async id => {
  await api.post('goods-acceptance/confirm/', { id });
});

export const deleteGoodsAcceptance = createAsyncThunk('goods/deleteGoodsAcceptance', async id => {
  await api.delete(`goods-acceptance/${id}/delete/`);
});

export const fetchGoodsAcceptanceUpdateFields = createAsyncThunk(
  'goods/fetchGoodsAcceptanceUpdateFields',
  async id => {
    return (await api.get(`goods-acceptance/${id}/update/fields`)).data;
  }
);

export const updateGoodsAcceptanceAct = createAsyncThunk(
  'goods/updateGoodsAcceptanceAct',
  async ({ actId, ...values }, { rejectWithValue }) => {
    try {
      const data = {};
      for (const key in values) {
        if (!values[key] && key !== 'unit_of_measure') continue;
        if (typeof values[key] === 'object' && values[key] !== null) {
          data[key] = values[key].value;
          continue;
        }
        data[key] = values[key];
      }

      await api.patch(`goods-acceptance/${actId}/update/`, { ...data });
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const fetchGoodsTypeWithTnved = createAsyncThunk(
  'goods/fetchGoodsTypeWithTnved',
  async () => {
    return (await api('goods-type-with-tnved/')).data;
  }
);

export const fetchPlacesByTnved = createAsyncThunk(
  'goods/fetchPlacesByTnved',
  async ({ id, tnved }) => {
    return (await api(`goods-acceptance/${id}/tnved/${tnved}/place/`)).data;
  }
);

export const createPlace = createAsyncThunk(
  'goods/createPlace',
  async (
    { weight, volume, pieces, actId, id_goods_type, id_tnved },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const place = (
        await api.post('place/create/', {
          id_goods_acceptance: Number(actId),
          id_goods_type: id_goods_type.value,
          id_tnved: id_tnved.value,
          weight,
          volume,
          pieces: Number(pieces),
        })
      ).data.place;
      const roleId = getState().auth.user.role_id;
      dispatch(
        roleId === 1
          ? fetchManagerGoodsAcceptanceInfo({ id: actId })
          : fetchStorekeeperGoodsAcceptanceInfo({ id: actId })
      );
      return place;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updatePlace = createAsyncThunk(
  'goods/updatePlace',
  async (
    { weight, volume, pieces, id, id_goods_type, id_tnved, actId, isEditMode },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const qr = (
        await api.put(`place/update/${id}/`, {
          id_goods_type: id_goods_type.value,
          id_tnved: id_tnved.value,
          weight,
          volume,
          pieces: Number(pieces),
        })
      ).data.place.qr;
      const roleId = getState().auth.user.role_id;
      dispatch(
        roleId === 1
          ? fetchManagerGoodsAcceptanceInfo({ id: actId })
          : fetchStorekeeperGoodsAcceptanceInfo({ id: actId })
      );

      if (isEditMode) {
        const tnved = getState().goods.placesByTnved.tnved_id;
        dispatch(fetchPlacesByTnved({ id: actId, tnved }));
      }
      return qr;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deletePlace = createAsyncThunk(
  'goods/deletePlace',
  async ({ id, actId, close }, { getState, dispatch }) => {
    const data = (await api.delete(`place/delete/${id}/`)).data;

    const roleId = getState().auth.user.role_id;
    dispatch(
      roleId === 1
        ? fetchManagerGoodsAcceptanceInfo({ id: actId })
        : fetchStorekeeperGoodsAcceptanceInfo({ id: actId })
    );

    if (!data.tnved_id) {
      return close();
    }

    const tnved = getState().goods.placesByTnved.tnved_id;
    dispatch(fetchPlacesByTnved({ id: actId, tnved }));
  }
);

export const finishActAcceptance = createAsyncThunk(
  'goods/fetchPlacesByTnved',
  async ({ id }, { dispatch, getState }) => {
    await api.post('goods-acceptance/finish/', { id });
    const roleId = getState().auth.user.role_id;
    dispatch(
      roleId === 1
        ? fetchManagerGoodsAcceptanceInfo({ id })
        : fetchStorekeeperGoodsAcceptanceInfo({ id })
    );
  }
);

export const fetchFilterDirectionList = createAsyncThunk(
  'goods/fetchFilterDirectionList',
  async () => {
    return (await api('goods-acceptance/direction-list/')).data;
  }
);

export const fetchFilterGoodsType = createAsyncThunk('goods/fetchFilterGoodsType', async () => {
  return (await api('goods-acceptance/goods-type-list/')).data;
});

export const fetchFilterTagList = createAsyncThunk('goods/fetchFilterTagList', async () => {
  return (await api('goods-acceptance/filter-tag-list/')).data;
});

export const fetchFilterStatusList = createAsyncThunk('goods/fetchFilterStatusList', async () => {
  return (await api('goods-acceptance/status-list/')).data;
});

export const fetchAwaitingInventoryActs = createAsyncThunk(
  'goods/fetchAwaitingInventoryActs',
  async searchParams => {
    return (await api(`goods-acceptance-not-finished/?${searchParams}`)).data;
  }
);

export const fetchAwaitingInventoryActsOrders = createAsyncThunk(
  'goods/fetchAwaitingInventoryActsOrders',
  async () => {
    return (await api('warehouse/goods-acceptance/storekeeper-ordering-fields/')).data;
  }
);

export const fetchAcceptedActs = createAsyncThunk('goods/fetchAcceptedActs', async searchParams => {
  return (await api(`storekeeper/goods-acceptance-waiting-approve/?${searchParams}`)).data;
});

export const fetchAcceptedActsOrders = createAsyncThunk(
  'goods/fetchAcceptedActsOrders',
  async () => {
    return (
      await api('warehouse/goods-acceptance-waiting-for-approve/storekeeper-ordering-fields/')
    ).data;
  }
);

export const fetchGoodsType = createAsyncThunk('goods/fetchGoodsType', async searchParams => {
  return (await api(`goods-type/?${searchParams}`)).data;
});

export const createGoodsType = createAsyncThunk(
  'goods/createGoodsType',
  async ({ values, searchParams }, { rejectWithValue, dispatch }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post('goods-type/create/', body);
      await dispatch(fetchGoodsType(searchParams));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateGoodsType = createAsyncThunk(
  'goods/updateGoodsType',
  async ({ id, values, searchParams }, { rejectWithValue, dispatch }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key] !== null) body[key] = values[key];
      }
      await api.put(`goods-type/update/${id}/`, body);
      await dispatch(fetchGoodsType(searchParams));
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const deleteGoodsType = createAsyncThunk(
  'goods/deleteGoodsType',
  async ({ id, searchParams, expandedCargo }, { dispatch }) => {
    await api.delete(`goods-type/delete/${id}/`);
    await dispatch(fetchGoodsType(searchParams));
    expandedCargo.forEach(id => {
      dispatch(fetchGoodsTypeTnved(id));
    });
  }
);

export const fetchGoodsTypeTnved = createAsyncThunk('tnved/fetchGoodsTypeTnved', async id => {
  const { data } = await api(`tnved/?goods_type_id=${id}`);
  return { id, data };
});

export const createTnved = createAsyncThunk(
  'goods/createTnved',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post('tnved/create/', body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateTnved = createAsyncThunk(
  'goods/updateTnved',
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.put(`tnved/update/${id}/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const deleteTnved = createAsyncThunk(
  'goods/deleteTnved',
  async ({ goodsTypeId, id, searchParams, expandedCargo }, { dispatch }) => {
    await api.delete(`tnved/delete/${id}/`);
    await dispatch(fetchGoodsType(searchParams));
    expandedCargo.forEach(id => {
      dispatch(fetchGoodsTypeTnved(id));
    });
  }
);
