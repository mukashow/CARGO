import mainStyle from './index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { deleteExpense, fetchDocumentExpenses } from '@/store/actions';
import * as yup from 'yup';
import { ErrorBoundaryHoc, ModalAction, Table } from '@/components';
import { useYupValidationResolver } from '@/hooks';
import { Row } from './Row';

const HEAD_ROW = ['expenseType', 'note', 'sum', 'tableDocAction'];

export const ExpensesTable = ErrorBoundaryHoc(
  ({ expenseInjectingMode, setCancelConfirmModal, tabConfirmFn }) => {
    const expenses = useSelector(state => state.documents.expenses);
    const [loading, setLoading] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { loadingListId, actId } = useParams();

    const schema = yup.object({
      extra_costs_type: yup.object().required(t('fieldShouldBeFilled')),
      currency: yup.object().required(t('modalCreateClientRequired')),
      comment: yup.string().max(1000, `${t('maxCharactersLength')} 1000`),
      cost: yup.lazy(value =>
        value === ''
          ? yup.string().required(t('fieldShouldBeFilled'))
          : yup
              .number()
              .typeError(t('enterNumber'))
              .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
              .required(t('fieldShouldBeFilled'))
              .transform((_, originalValue) => Number(String(originalValue).replace(/,/g, '.')))
      ),
    });
    const resolver = useYupValidationResolver(schema);
    const form = useForm({ resolver });

    const onDelete = () => {
      setLoading(true);
      dispatch(deleteExpense(idToDelete))
        .then(() => {
          setIdToDelete(null);
          dispatch(fetchDocumentExpenses(loadingListId || actId));
        })
        .finally(() => setLoading(false));
    };

    return (
      <>
        <Table
          headRow={HEAD_ROW}
          row={expenses?.extra_cost_list}
          {...(!expenseInjectingMode && { tableStyle: { minWidth: 'auto' } })}
          RowComponent={Row}
          rowProps={{
            setCancelConfirmModal,
            setLoading,
            setIdToDelete,
            expenseInjectingMode,
            tabConfirmFn,
            ...form,
          }}
          withBorder
          className={mainStyle.expensesTable}
          emptyMessage="expensesListEmpty"
          loading={loading}
        />
        <ModalAction
          isOpen={!!idToDelete}
          onCancel={() => setIdToDelete(null)}
          title={t('toDeleteExpense')}
          description={t('toDeleteExpenseDescription')}
          submitButtonDisabled={loading}
          onSubmit={onDelete}
        />
      </>
    );
  }
);
