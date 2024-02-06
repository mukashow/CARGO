import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchClientGoodsAcceptance = createAsyncThunk(
  'bill/fetchClientGoodsAcceptance',
  async id => {
    return (await api(`client/${id}/bill/goods-acceptance-to-add/`)).data;
  }
);

export const fetchGoodsForBillAdding = createAsyncThunk(
  'bill/fetchGoodsForBillAdding',
  async id => {
    const data = (await api(`bill/${id}/goods-acceptance/`)).data;
    data.extra_goods_acceptance_list = data.extra_goods_acceptance_list.map((item, index) => {
      return { ...item, is_extra: true, is_first_extra_el: index === 0 };
    });
    return {
      ...data,
      goods_acceptance_list: [...data.goods_acceptance_list, ...data.extra_goods_acceptance_list],
    };
  }
);

export const fetchPlacesForAddingToBill = createAsyncThunk(
  'bill/fetchPlacesForAddingToBill',
  async ({ billId, cargoId, actId, is_extra }) => {
    const data = (await api(`bill/${billId}/goods/${cargoId}/place/`)).data;
    return {
      ...data,
      place_list: data.place_list.map(item => ({ ...item, isChecked: item.is_added })),
      cargoId,
      actId,
      is_extra,
    };
  }
);

export const fetchCargoPlaces = createAsyncThunk(
  'bill/fetchCargoPlaces',
  async ({ billId, cargoId }) => {
    return (await api(`bill/${billId}/goods/${cargoId}/place/`)).data;
  }
);

export const createInvoice = createAsyncThunk(
  'bill/createInvoice',
  async (id, { rejectWithValue }) => {
    try {
      return (await api.post('bill/create/', { client: id })).data;
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors);
    }
  }
);

export const addOrDeleteGoodsOfBill = createAsyncThunk(
  'bill/addOrDeleteGoodsOfBill',
  async ({ billId }, { getState, rejectWithValue }) => {
    const { places, extraPlaces } = getState().bill;
    try {
      const addPromise = api.post(`bill/${billId}/add/`, {
        goods_acceptance_list: places.adds.goods_acceptance_list,
        extra_goods_acceptance_list: extraPlaces.adds.goods_acceptance_list,
      });
      const deletePromise = api.post(`bill/${billId}/delete/`, {
        goods_acceptance_list: places.deletes.goods_acceptance_list,
        extra_goods_acceptance_list: extraPlaces.deletes.goods_acceptance_list,
      });
      await Promise.all([addPromise, deletePromise]);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);
