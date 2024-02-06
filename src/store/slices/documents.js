import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersDocumentsType,
  fetchFilesType,
  fetchContractType,
  fetchDocumentDocTypes,
  fetchDocTypes,
  fetchDocTypeOrders,
  fetchDocType,
  fetchDocTypesByRole,
  fetchAllDocTypes,
  fetchDocTypeRule,
  fetchLimitationsDescription,
  fetchRuleDetail,
  fetchConsumptionType,
  fetchConsumptionDocType,
  fetchConsumptionTypeOne,
  fetchExpenseOne,
  fetchExpenseType,
  fetchDocumentExpenses,
  fetchAllDocTypesByRole,
  fetchDocTypeByRoleOne,
} from '@actions/documents';
import { fetchAllContainerDocumentTypes } from '@actions';

const initialState = {
  usersDocumentsType: null,
  filesType: null,
  contractType: null,
  docTypes: null,
  docType: null,
  orders: null,
  docTypesByRole: null,
  docTypeByRoleOne: null,
  allDocTypesByRole: null,
  docTypesList: null,
  rule: null,
  consumptionType: null,
  consumptionDocType: null,
  consumptionTypeOne: null,
  expenses: null,
  expenseType: { loadingList: null, goods: null },
};

export const documents = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setUsersDocumentsType: (state, { payload }) => {
      state.usersDocumentsType = payload;
    },
    setExpenseInjectMode: (state, { payload }) => {
      switch (payload.type) {
        case 'create':
          state.expenses.extra_cost_list.unshift({ createMode: true });
          break;
        case 'edit':
          const index = state.expenses?.extra_cost_list.findIndex(({ id }) => id === payload.id);
          if (index !== -1) {
            state.expenses.extra_cost_list[index].editMode = true;
          }
          break;
        default:
          state.expenses.extra_cost_list = state.expenses.extra_cost_list
            .filter(({ createMode }) => !createMode)
            .map(({ editMode, ...item }) => item);
      }
    },
  },
  extraReducers: {
    [fetchUsersDocumentsType.fulfilled]: (state, { payload }) => {
      state.usersDocumentsType = payload;
    },
    [fetchDocumentDocTypes.fulfilled]: (state, { payload }) => {
      state.usersDocumentsType = payload;
    },
    [fetchAllContainerDocumentTypes.fulfilled]: (state, { payload }) => {
      state.usersDocumentsType = payload.map(doc => ({ ...doc, dependents: [] }));
    },
    [fetchFilesType.fulfilled]: (state, { payload }) => {
      state.filesType = payload;
    },
    [fetchContractType.fulfilled]: (state, { payload }) => {
      state.contractType = payload;
    },
    [fetchDocTypes.fulfilled]: (state, { payload }) => {
      state.docTypes = payload;
    },
    [fetchDocTypeOrders.fulfilled]: (state, { payload }) => {
      state.orders = payload;
    },
    [fetchDocType.fulfilled]: (state, { payload }) => {
      state.docType = payload;
    },
    [fetchDocTypesByRole.fulfilled]: (state, { payload }) => {
      state.docTypesByRole = payload;
    },
    [fetchAllDocTypesByRole.fulfilled]: (state, { payload }) => {
      state.allDocTypesByRole = payload;
    },
    [fetchDocTypeByRoleOne.fulfilled]: (state, { payload }) => {
      state.docTypeByRoleOne = payload;
    },
    [fetchAllDocTypes.fulfilled]: (state, { payload }) => {
      state.docTypesList = payload;
    },
    [fetchDocTypeRule.fulfilled]: (state, { payload }) => {
      const docType = state.docTypes.results.find(({ id }) => payload.id === id);
      if (docType) docType.limitations = payload.limitations;
    },
    [fetchLimitationsDescription.fulfilled]: (state, { payload }) => {
      state.limitationsDescription = payload;
    },
    [fetchRuleDetail.fulfilled]: (state, { payload }) => {
      state.rule = payload;
    },
    [fetchConsumptionType.fulfilled]: (state, { payload }) => {
      state.consumptionType = payload;
    },
    [fetchConsumptionDocType.fulfilled]: (state, { payload }) => {
      state.consumptionDocType = payload;
    },
    [fetchConsumptionTypeOne.fulfilled]: (state, { payload }) => {
      state.consumptionTypeOne = payload;
    },
    [fetchDocumentExpenses.fulfilled]: (state, { payload }) => {
      state.expenses = payload;
    },
    [fetchExpenseType.fulfilled]: (state, { payload }) => {
      if (payload.doc_type) {
        state.expenseType[payload.doc_type] = payload.data;
      } else {
        state.expenseType.all = payload;
      }
    },
    [fetchExpenseOne.fulfilled]: (state, { payload }) => {
      const index = state.expenses?.extra_cost_list.findIndex(({ id }) => id === payload.id);
      if (index !== -1) {
        state.expenses.extra_cost_list[index] = {
          ...state.expenses.extra_cost_list[index],
          ...payload,
        };
      }
    },
  },
});

export const { setUsersDocumentsType, setExpenseInjectMode } = documents.actions;

export default documents.reducer;
