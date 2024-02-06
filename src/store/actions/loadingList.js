import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { uninterceptedAxiosInstance } from '@/api';

export const createLoadingList = createAsyncThunk(
  'loadingList/createLoadingList',
  async (values, { getState, rejectWithValue }) => {
    try {
      const roleId = getState().auth.user.role_id;
      const body = {};

      for (const key in values) {
        if (typeof values[key] === 'object' && values[key] !== null) {
          body[key] = values[key].value;
        } else if (values[key]) {
          body[key] = values[key];
        }
      }

      return (
        await api.post(roleId === 5 ? 'loading-list/create/' : 'manager/loading-list/create/', body)
      ).data.id;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const fetchCanUpdateLoadingList = createAsyncThunk(
  'loadingList/fetchCanUpdateLoadingList',
  async id => {
    return (await uninterceptedAxiosInstance(`loading-list/${id}/can-update/`)).data;
  }
);

export const updateLoadingList = createAsyncThunk(
  'loadingList/updateLoadingList',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};

      for (const key in values) {
        if (typeof values[key] === 'object' && values[key] !== null) {
          body[key] = values[key].value;
        } else if (values[key]) {
          body[key] = values[key];
        }
      }
      await api.put(`loading-list/${id}/update/`, body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const fetchLoadingListInfo = createAsyncThunk(
  'loadingList/fetchLoadingListInfo',
  async ({ id, navigate }, { getState }) => {
    const roleId = getState().auth.user.role_id;
    try {
      return (await api(`loading-list/${id}/`)).data;
    } catch (e) {
      if (navigate && String(e.response.status).match(/404|403/)) {
        navigate(
          roleId === 1 || roleId === 5 ? '/warehouse?tab=loading_lists&page=1&page_size=50' : '/'
        );
      }
    }
  }
);

export const deleteLoadingList = createAsyncThunk('loadingList/deleteLoadingList', async id => {
  await api.delete(`loading-list/${id}/delete/`);
});

export const removeContainerFromLoadingList = createAsyncThunk(
  'loadingList/removeContainerFromLoadingList',
  async id => {
    await api.delete(`loading-list/${id}/container/delete/`);
  }
);

export const removeCarFromLoadingList = createAsyncThunk(
  'loadingList/removeCerFromLoadingList',
  async ({ id, carId }) => {
    await api.delete(`loading-list/${id}/car/${carId}/delete/`);
  }
);

export const fetchLoadingListOrders = createAsyncThunk('loadingList/fetchOrders', async () => {
  return (await api('loading-list/ordering-fields/')).data;
});

export const fetchLoadingListRoutes = createAsyncThunk(
  'loadingList/fetchLoadingListRoutes',
  async ({ id }, { getState }) => {
    const roleId = getState().auth.user.role_id;

    if (roleId === 1) {
      return (await api('warehouse/loading-list/route/')).data;
    }
    if (roleId === 4) {
      return (await api('loading-list/waiting-for-broker-approve/route/')).data;
    }
    if (id) {
      return (await api(`warehouse/${id}/loading-list/route/`)).data;
    }
    return (await api('loading-list/route/')).data;
  }
);

export const fetchLoadingListGoodsType = createAsyncThunk(
  'loadingList/fetchLoadingListGoodsType',
  async ({ id }, { getState }) => {
    const roleId = getState().auth.user.role_id;

    if (roleId === 1) {
      return (await api('warehouse/loading-list/goods-type/')).data;
    }
    if (roleId === 4) {
      return (await api('loading-list/waiting-for-broker-approve/goods-type/')).data;
    }
    if (id) {
      return (await api(`warehouse/${id}/loading-list/goods-type/`)).data;
    }
    return (await api('loading-list/goods-type/')).data;
  }
);

export const fetchLoadingListStatus = createAsyncThunk(
  'loadingList/fetchLoadingListStatus',
  async () => {
    return (await api('loading-list/status/')).data;
  }
);

export const fetchLoadingList = createAsyncThunk(
  'loadingList/fetchLoadingList',
  async ({ warehouseId, searchParams }, { getState }) => {
    const roleId = getState().auth.user.role_id;

    if (roleId === 1) {
      return (await api(`warehouse/loading-list/?${searchParams}`)).data;
    }
    if (roleId === 4) {
      return (await api(`loading-list/waiting-for-broker-approve/?${searchParams}`)).data;
    }
    if (warehouseId) {
      return (await api(`warehouse/${warehouseId}/loading-list/?${searchParams}`)).data;
    }
    return (await api(`loading-list/?${searchParams}`)).data;
  }
);

export const addContainerToLoadingList = createAsyncThunk(
  'loadingList/addContainerToLoadingList',
  async ({ loadingList, container }) => {
    await api.post(`loading-list/${loadingList}/container/${container}/add/`);
  }
);

export const addCarToLoadingList = createAsyncThunk(
  'loadingList/addContainerToLoadingList',
  async ({ loadingList, ...values }) => {
    await api.post(`loading-list/${loadingList}/car/create/`, values);
  }
);

export const fetchGoodsToAddOrders = createAsyncThunk(
  'loadingList/fetchGoodsToAddOrders',
  async () => {
    return (await api('loading-list/goods-acceptance-to-add/ordering-fields/')).data;
  }
);

export const fetchGoodsToAddToLoadingList = createAsyncThunk(
  'loadingList/fetchGoodsToAddToLoadingList',
  async ({ id, searchParams }) => {
    return (await api(`loading-list/${id}/goods-acceptance-to-add/?${searchParams}`)).data;
  }
);

export const addActAcceptanceToLoadingList = createAsyncThunk(
  'loadingList/addActAcceptanceToLoadingList',
  async ({ id, goods_acceptance_id_list }) => {
    await api.post(`loading-list/${id}/goods-acceptance-list/add/`, { goods_acceptance_id_list });
  }
);

export const removeActAcceptanceFromLoadingList = createAsyncThunk(
  'loadingList/removeActAcceptanceFromLoadingList',
  async ({ id, goods_acceptance_id_list }) => {
    await api.delete(
      `loading-list/${id}/goods-acceptance/delete/?goods_acceptance_id=${goods_acceptance_id_list}`
    );
  }
);

export const addAndRemoveActAcceptanceFromLoadingList = createAsyncThunk(
  'loadingList/addAndRemoveActAcceptanceFromLoadingList',
  async (
    { loadingListId, checkedActs, navigate, close, fetchLoadingList },
    { dispatch, getState }
  ) => {
    const goods = getState().loadingList.goodsToAdd;

    const goodsToAdd = [];
    const goodsToRemove = [];
    goods.results.forEach(({ id, is_added }) => {
      if (checkedActs.includes(id) && !is_added) return goodsToAdd.push(id);
      if (!checkedActs.includes(id) && is_added) goodsToRemove.push(id);
    });

    if (!goodsToAdd.length && !goodsToRemove.length) return close();

    let addPromise = Promise.resolve();
    if (goodsToAdd.length) {
      addPromise = dispatch(
        addActAcceptanceToLoadingList({ id: loadingListId, goods_acceptance_id_list: goodsToAdd })
      );
    }

    let removePromise = Promise.resolve();
    if (goodsToRemove.length) {
      removePromise = dispatch(
        removeActAcceptanceFromLoadingList({
          id: loadingListId,
          goods_acceptance_id_list: goodsToRemove,
        })
      );
    }

    await Promise.all([addPromise, removePromise]);
    fetchLoadingList();
    close();
  }
);

export const fetchLoadingListConfirmStatuses = createAsyncThunk(
  'loadingList/fetchLoadingListConfirmStatuses',
  async ({ id }) => {
    return (await api(`loading-list/${id}/available-status/`)).data;
  }
);

export const changeLoadingListStatus = createAsyncThunk(
  'loadingList/changeLoadingListStatus',
  async ({ id }) => {
    await api.post(`/loading-list/${id}/move/`);
  }
);

export const returnForRevision = createAsyncThunk(
  'loadingList/returnForRevision',
  async ({ id, values: { comment, comments } }) => {
    const goods_list = comments
      .filter(({ checked }) => !!checked)
      .map(({ receiver, tnved, comment }) => ({ receiver, tnved, comment: comment || '' }));

    await api.post(`loading-list/${id}/goods/create-defect/`, {
      comment,
      goods_list,
    });
  }
);

export const fetchLoadingListPlaces = createAsyncThunk(
  'loadingList/fetchLoadingListPlaces',
  async ({ loadingListId, tnved, receiver }) => {
    const { data } = await api(
      `loading-list/${loadingListId}/tnved/${tnved}/receiver/${receiver}/place/`
    );
    return { ...data, receiver };
  }
);

export const fetchLoadingTasksRoutes = createAsyncThunk(
  'loadingList/fetchLoadingTasksRoutes',
  async () => (await api('loading-list/loading-task/route/')).data
);

export const fetchUnloadingTasksRoutes = createAsyncThunk(
  'loadingList/fetchUnloadingTasksRoutes',
  async () => (await api('loading-list-for-unloading/route/')).data
);

export const fetchLoadingTasksOrders = createAsyncThunk(
  'loadingList/fetchLoadingTasksOrders',
  async () => {
    const { data } = await api('loading-list/loading-task/ordering-fields/');
    return data.map(({ key, value }) => ({ id: key, name: value }));
  }
);

export const fetchUnloadingTasksOrders = createAsyncThunk(
  'loadingList/fetchUnloadingTasksOrders',
  async () => {
    const { data } = await api('loading-list-for-unloading/ordering-fields/');
    return data.map(({ key, value }) => ({ id: key, name: value }));
  }
);

export const fetchLoadingTasks = createAsyncThunk(
  'loadingList/fetchLoadingTasks',
  async searchParams => {
    return (await api(`loading-list/loading-task/?${searchParams}`)).data;
  }
);

export const fetchTasksForUnloading = createAsyncThunk(
  'loadingList/fetchTasksForUnloading',
  async searchParams => {
    return (await api(`loading-list-for-unloading/?${searchParams}`)).data;
  }
);

export const scanLoadingListPlace = createAsyncThunk(
  'loadingList/scanLoadingListPlace',
  async ({ id, loadingListId }) => {
    return (await api.post(`loading-list/${loadingListId}/place/${id}/add/`)).data;
  }
);

export const fetchScannedPlaces = createAsyncThunk('loadingList/fetchScannedPlaces', async id => {
  return (await api(`loading-list/${id}/tnved/scanned-place/`)).data;
});

export const cancelScan = createAsyncThunk(
  'loadingList/cancelScan',
  async ({ placeId, loadingListId }) => {
    await api.delete(`loading-list/${loadingListId}/place/${placeId}/delete/`);
  }
);

export const fetchAwaitingCustomClearanceLoadingList = createAsyncThunk(
  'loadingList/fetchAwaitingCustomClearanceLoadingList',
  async searchParams => {
    return (await api(`loading-list/custom-clearance-required/?${searchParams}`)).data;
  }
);

export const fetchAwaitingCustomClearanceLoadingListRoutes = createAsyncThunk(
  'loadingList/fetchAwaitingCustomClearanceLoadingListRoutes',
  async () => {
    return (await api('loading-list/custom-clearance-required/route/')).data;
  }
);

export const fetchAwaitingCustomClearanceLoadingListGoodsType = createAsyncThunk(
  'loadingList/fetchAwaitingCustomClearanceLoadingListGoodsType',
  async () => {
    return (await api('loading-list/custom-clearance-required/goods-type/')).data;
  }
);

export const fetchAwaitingCustomClearanceLoadingListOrders = createAsyncThunk(
  'loadingList/fetchAwaitingCustomClearanceLoadingListOrders',
  async () => {
    return (await api('loading-list/custom-clearance-required/ordering-fields/')).data;
  }
);

export const markConfiscatedPlaces = createAsyncThunk(
  'loading-list/markConfiscatedPlaces',
  async ({ loadingListId, goods, setError }) => {
    const promises = goods
      .filter(({ place_count }) => place_count !== '')
      .map(
        ({ receiver, tnved_code, place_count, comment, index }) =>
          new Promise(async (resolve, reject) => {
            try {
              await api.post(`loading-list/${loadingListId}/confiscate-goods/`, {
                receiver,
                tnved_code,
                place_count,
                comment,
              });
              resolve();
            } catch ({
              response: {
                data: { field_errors },
              },
            }) {
              for (const key in field_errors) {
                setError(`goods.${index}.${key}`, {
                  message: field_errors[key],
                  type: 'manual',
                });
              }
              reject();
            }
          })
      );
    await Promise.all(promises);
  }
);

export const confiscatePlace = createAsyncThunk(
  'loadingList/confiscatePlace',
  async ({ loadingListId, place, comment }) => {
    await api.post(`loading-list/${loadingListId}/confiscate-place/`, { place, comment });
  }
);

export const fetchGoodsForUnloading = createAsyncThunk(
  'loadingList/fetchGoodsForUnloading',
  async id => {
    return (await api(`loading-list-for-unloading/${id}/`)).data;
  }
);

export const unloadPlace = createAsyncThunk(
  'loadingList/unloadPlace',
  async ({ loadingListId, placeId }) => {
    return (await api.post(`loading-list/${loadingListId}/place/${placeId}/unload/`)).data;
  }
);

export const cancelUnloadingPlace = createAsyncThunk(
  'loadingList/cancelUnloadingPlace',
  async ({ loadingListId, placeId }) => {
    return (await api.post(`loading-list/${loadingListId}/place/${placeId}/cancel-unload/`)).data;
  }
);

export const markPlaceFound = createAsyncThunk(
  'loadingList/markPlaceFound',
  async ({ loadingListId, placeId }) => {
    await api.post(`loading-list/${loadingListId}/place/${placeId}/found-place/`);
  }
);

export const createSeal = createAsyncThunk(
  'loadingList/createSeal',
  async ({ loadingListId, number }, { rejectWithValue }) => {
    try {
      await api.post(`loading-list/${loadingListId}/seal/create/`, { number });
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deleteSeal = createAsyncThunk(
  'loadingList/deleteSeal',
  async ({ loadingListId, sealId }) => {
    await api.delete(`loading-list/${loadingListId}/seal/${sealId}/delete/`);
  }
);
