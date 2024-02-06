import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTransportationType = createAsyncThunk(
  'transportation/fetchTransportationType',
  async () => {
    const { data } = await api.get('transportation-type/');
    return data.map(({ name, id }) => ({ label: name, value: id }));
  }
);
