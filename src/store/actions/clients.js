import api from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchClients = createAsyncThunk('clients/fetchClients', async searchParams => {
  return (await api.get(`client/?${searchParams}`)).data;
});

export const getClientCreate = async client => {
  const body = {};
  for (const key in client) {
    if (typeof client[key] === 'object') {
      if (Array.isArray(client[key])) {
        body[key] = client[key].map(item => {
          const itemObj = {};
          for (const key in item) {
            if (typeof item[key] === 'object') {
              itemObj[key] = item[key].value;
            } else {
              itemObj[key] = item[key];
            }
          }
          return itemObj;
        });
      } else {
        body[key] = client[key].value;
      }
    } else {
      body[key] = client[key];
    }
  }
  return await api.post(`client/create/`, body);
};
export const getClientUpdate = async (clientId, client) => {
  return (await api.put(`client/${clientId}/update/`, { ...client, country: client.country.value }))
    .data;
};
export const getClientUpdatePatch = async (clientId, client) => {
  return await api.patch(`client/${clientId}/update/`, client);
};

export const setContractType = async (clientId, contract_type) => {
  return await api.post('client/set-default-contract-type/', {
    client_id: +clientId,
    contract_type,
  });
};

export const fetchUserDocuments = createAsyncThunk('clients/fetchUserDocuments', async clientId => {
  return (await api.get(`user/${clientId}/document/`)).data;
});

export const fetchClient = createAsyncThunk('clients/fetchClient', async clientId => {
  return (await api.get(`client/${clientId}/`)).data;
});

export const fetchClientOrders = createAsyncThunk('clients/fetchClientOrders', async () => {
  return (await api.get('client/ordering-fields/')).data;
});

export const fetchClientCode = createAsyncThunk('clients/fetchClientCode', async () => {
  return (await api.get('client/client-code-name/')).data;
});

export const fetchClientInfoByCode = createAsyncThunk(
  'clients/fetchClientInfoByCode',
  async ({ code, type }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`client/${code}/info/`);
      return {
        data,
        type,
      };
    } catch ({ response: { data } }) {
      return rejectWithValue(data.detail);
    }
  }
);

export const fetchClientContractType = createAsyncThunk(
  'clients/fetchClientContractType',
  async (clientId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`client/${clientId}/contract/`);
      return data.map(({ id, name }) => ({ label: name, value: id }));
    } catch ({ response: { data } }) {
      return rejectWithValue(data.detail);
    }
  }
);

export const loadClientsAsync = async (value, isPhoneSearch) => {
  try {
    const isSearchByPhone = typeof isPhoneSearch === 'boolean' && isPhoneSearch;
    const { data } = await api.get(
      `client/search-list/?${
        isSearchByPhone ? `phone=${value.replaceAll('+', '%2b')}` : `code=${value}`
      }`
    );
    return data.map(({ code, id, phone }) => ({
      label: isSearchByPhone ? `${phone.country_code}${phone.number}` : code,
      value: id,
      code,
    }));
  } catch ({ response: { data } }) {
    return [{ label: data.detail, value: '', isDisabled: true }];
  }
};

export const fetchDocumentDocuments = createAsyncThunk(
  'loadingList/fetchDocumentDocuments',
  async id => {
    return (await api(`document/${id}/dependent-document-list/`)).data;
  }
);
