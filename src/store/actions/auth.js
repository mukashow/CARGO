import { toast } from 'react-toastify';
import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ formData, navigate, t }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('login/', formData);
      localStorage.setItem('cargoRefreshToken', data.refresh);
      localStorage.setItem('cargoToken', data.access);
      localStorage.setItem('cargoRoleId', data.role_id);
      localStorage.setItem('cargoRoleName', data.role_name);
      localStorage.setItem('cargoName', data.name);
      localStorage.setItem('cargoLastName', data.last_name);
      localStorage.setItem('cargoOtchestvo', data.otchestvo);
      localStorage.setItem('hasStorekeeperPermissions', String(!!data.has_storekeeper_permissions));
      localStorage.setItem('hasCashierPermissions', String(!!data.has_cashier_permissions));
      navigate('/', { replace: true });
      toast.success(`${t('successAuth')}: ${data.name}`);
      return data;
    } catch ({ response: { data } }) {
      return rejectWithValue(data.detail);
    }
  }
);
