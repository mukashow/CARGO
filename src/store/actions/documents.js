import api, { uninterceptedAxiosInstance } from '@/api';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserDocuments, fetchDocumentDocuments } from '@actions/clients';
import {
  fetchAllContainerDocumentTypes,
  fetchContainerDocuments,
  fetchContainerOne,
} from '@/store/actions/container';

export const fetchUsersDocumentsType = createAsyncThunk(
  'documents/fetchUsersDocumentsType',
  async id => {
    return (await api.get(`user/${id}/document-type/`)).data;
  }
);

export const fetchFilesType = createAsyncThunk('documents/fetchFilesType', async () => {
  return (await api.get('document/filetype/')).data;
});

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async ({ clientId, doc_type, comment }) => {
    return (
      await api.post(`user/${clientId}/document/create/`, {
        doc_type: doc_type.value,
        comment: comment || null,
      })
    ).data.id;
  }
);

export const addDocToDocument = createAsyncThunk(
  'documents/addDocToDocument',
  async ({ docId, doc_type, comment }) => {
    return (
      await api.post(`document/${docId}/add-document/`, {
        doc_type: doc_type.value,
        comment: comment || null,
      })
    ).data.id;
  }
);

export const addFileToDocument = createAsyncThunk(
  'documents/addFileToDocument',
  async ({ files, document_id, fileStatus, clientId, setFileStatus }) => {
    const promises = files.map(
      ({ file }, index) =>
        new Promise(async (resolve, reject) => {
          if (fileStatus && fileStatus[index] === 'success') return resolve();

          try {
            const formData = new FormData();
            formData.append('file', file);
            await uninterceptedAxiosInstance.post(`document/${document_id}/files/add/`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (setFileStatus) {
              setFileStatus(state =>
                state.map((status, statusIndex) => (statusIndex === index ? 'success' : status))
              );
            }
            resolve();
          } catch (e) {
            if (setFileStatus) {
              setFileStatus(state =>
                state.map((status, statusIndex) => (statusIndex === index ? 'error' : status))
              );
            }
            reject();
          }
        })
    );

    await Promise.all(promises);
  }
);

export const fetchDocument = createAsyncThunk('documents/fetchDocument', async id => {
  return (await api(`document/${id}/`)).data;
});

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async ({ id, clientId, type }, { dispatch }) => {
    await api.delete(`document/${id}/delete/`);

    switch (type) {
      case 'document':
        dispatch(fetchDocumentDocuments(clientId));
        dispatch(fetchDocumentDocTypes(clientId));
        break;
      case 'container':
        dispatch(fetchContainerDocuments(clientId));
        dispatch(fetchAllContainerDocumentTypes(clientId));
        dispatch(fetchContainerOne(clientId));
        break;
      default:
        dispatch(fetchUserDocuments(clientId));
        dispatch(fetchUsersDocumentsType(clientId));
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      await api.patch(`document/${id}/update/`, { comment: comment || null });
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const deleteFileFromDocument = createAsyncThunk(
  'documents/deleteFileFromDocument',
  async ({ fileId, docId, clientId, type }, { dispatch }) => {
    await api.delete(`document/${docId}/files/${fileId}/delete/`);
    switch (type) {
      case 'document':
        dispatch(fetchDocumentDocuments(clientId));
        break;
      case 'container':
        dispatch(fetchContainerDocuments(clientId));
        break;
      default:
        dispatch(fetchUserDocuments(clientId));
    }
  }
);

export const fetchContractType = createAsyncThunk('document/fetchContractType', async () => {
  return (await api('document/contract-type/')).data;
});

export const fetchDocDependentTypes = createAsyncThunk('document/fetchContractType', async id => {
  return (await api(`document-type/${id}/dependent-document-types/`)).data;
});

export const fetchDocumentDocTypes = createAsyncThunk(
  'loadingList/fetchDocumentDocTypes',
  async id => {
    return (await api(`document/${id}/document-type/`)).data;
  }
);

export const fetchDocTypes = createAsyncThunk('document/fetchDocTypes', async searchParams => {
  return (await api(`document/document-type/?${searchParams}`)).data;
});

export const fetchDocType = createAsyncThunk('document/fetchDocType', async id => {
  return (await api(`document/document-type/${id}/`)).data;
});

export const fetchDocTypeOrders = createAsyncThunk('document/fetchDocTypeOrders', async () => {
  return (await api('document/document-type/ordering-fields/')).data;
});

export const deleteDocType = createAsyncThunk(
  'document/deleteDocType',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`document/document-type/${id}/delete/`);
    dispatch(fetchDocTypes(searchParams));
  }
);

export const createDocType = createAsyncThunk(
  'document/createDocType',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post('document/document-type/create/', body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updateDocType = createAsyncThunk(
  'document/updateDocType',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.put(`document/document-type/${id}/update/`, body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const createRule = createAsyncThunk(
  'point/createRule',
  async ({ doc_type, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.post('rule/create/', { doc_type, ...body });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateRule = createAsyncThunk(
  'point/updateRule',
  async ({ doc_type, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key];
      }
      await api.put(`rule/${doc_type}/update/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const fetchRuleDetail = createAsyncThunk('point/fetchRuleDetail', async id => {
  return (await api(`rule/${id}/`)).data;
});

export const fetchAllDocTypes = createAsyncThunk('document/fetchAllDocTypes', async () => {
  return (await api('document/document-type/?no_pagination=true')).data;
});

export const fetchDocTypesByRole = createAsyncThunk(
  'document/fetchDocTypesByRole',
  async searchParams => {
    return (await api(`document/role-document-type/?${searchParams}`)).data;
  }
);

export const deleteDocTypeByRole = createAsyncThunk(
  'document/deleteDocTypeByRole',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`document/role-document-type/${id}/delete/`);
    dispatch(fetchDocTypesByRole(searchParams));
  }
);

export const fetchDocTypeByRoleOne = createAsyncThunk(
  'document/fetchDocTypeByRoleOne',
  async id => {
    return (await api(`document/role-document-type/document-type/${id}/`)).data;
  }
);

export const fetchAllDocTypesByRole = createAsyncThunk(
  'document/fetchAllDocTypesByRole',
  async () => {
    return (await api('document/role-document-type/?no_pagination=true')).data;
  }
);

export const changeDocTypeByRole = createAsyncThunk(
  'document/createDocTypeByRole',
  async ({ document_type, role_list }, { rejectWithValue }) => {
    try {
      await api.post('document/role-document-type/change/', {
        document_type: document_type.id,
        role_list: role_list.map(({ id }) => id),
      });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const fetchDocTypeRule = createAsyncThunk('document/fetchDocTypeRule', async id => {
  const { data } = await api(`/rule/?doc_type_id=${id}`);
  return { limitations: data.results, id };
});

export const fetchLimitationsDescription = createAsyncThunk(
  'document/fetchLimitationsDescription',
  async () => {
    return (await api('rule/description/')).data;
  }
);

export const deleteRule = createAsyncThunk(
  'document/deleteRule',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteStatusRestriction = createAsyncThunk(
  'document/deleteStatusRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/loading-list-status/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteTransportationTypeRestriction = createAsyncThunk(
  'document/deleteTransportationTypeRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/transportation-type/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteWaypointRestriction = createAsyncThunk(
  'document/deleteWaypointRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/route-point/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteContractTypeRestriction = createAsyncThunk(
  'document/deleteContractTypeRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/contract-type/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteContainerRestriction = createAsyncThunk(
  'document/deleteContainerRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/container/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteEmployeeRestriction = createAsyncThunk(
  'document/deleteEmployeeRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/worker/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteEmptyRestriction = createAsyncThunk(
  'document/deleteEmptyRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/void/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const deleteDocumentTypeRestriction = createAsyncThunk(
  'document/deleteDocumentTypeRestriction',
  async ({ id, expandedRow }, { dispatch }) => {
    await api.delete(`rule/${id}/document-type/delete/`);
    dispatch(fetchDocTypeRule(expandedRow));
  }
);

export const fetchConsumptionType = createAsyncThunk(
  'document/fetchConsumptionType',
  async searchParams => {
    return (await api(`extra-cost-type/?${searchParams}`)).data;
  }
);

export const fetchConsumptionTypeOne = createAsyncThunk(
  'document/fetchConsumptionTypeOne',
  async id => {
    return (await api(`extra-cost-type/${id}/`)).data;
  }
);

export const fetchConsumptionDocType = createAsyncThunk(
  'document/fetchConsumptionDocType',
  async () => {
    return (await api('extra-cost/document-type/')).data;
  }
);

export const createConsumptionType = createAsyncThunk(
  'document/createConsumptionType',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.post('extra-cost-type/create/', body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateConsumptionType = createAsyncThunk(
  'document/updateConsumptionType',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.put(`extra-cost-type/${id}/update/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const deleteConsumptionType = createAsyncThunk(
  'document/deleteConsumptionType',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`extra-cost-type/${id}/delete/`);
    dispatch(fetchConsumptionType(searchParams));
  }
);

export const fetchDocumentExpenses = createAsyncThunk(
  'documents/fetchDocumentExpenses',
  async id => {
    return (await api(`document/${id}/extra-cost/`)).data;
  }
);

export const fetchExpenseType = createAsyncThunk(
  'documents/fetchExpenseType',
  async ({ doc_type_id, doc_type }) => {
    const { data } = await api(
      `extra-cost-type/${doc_type_id ? `?doc_type_id=${doc_type_id}` : ''}`
    );
    if (doc_type_id) return { data, doc_type };
    return data;
  }
);

export const deleteExpense = createAsyncThunk('documents/deleteExpense', async id => {
  await api.delete(`extra-cost/${id}/delete`);
});

export const fetchExpenseOne = createAsyncThunk('documents/fetchExpenseOne', async id => {
  return (await api(`extra-cost/${id}/`)).data;
});

export const createExpense = createAsyncThunk(
  'documents/createExpense',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].value;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.post('extra-cost/create/', body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'documents/updateExpense',
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values !== null) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].value;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.put(`extra-cost/${id}/update/`, body);
    } catch ({ response: { data } }) {
      return rejectWithValue(data.field_errors);
    }
  }
);
