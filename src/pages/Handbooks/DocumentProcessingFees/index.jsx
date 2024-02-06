import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, ModalAction, Table, TableTabs } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  deleteDocProcessingFee,
  fetchClientDocProcessingFees,
  fetchDocProcessingFees,
  fetchDocTariffOrders,
  fetchPhoneCode,
  fetchTransportationType,
} from '@/store/actions';
import { useSearchParamsState } from '@/hooks';
import { ModalCreateEditDocProcFee, Row, TableFilter } from './components';

export const DocumentProcessingFees = ErrorBoundaryHoc(() => {
  const orders = useSelector(state => state.tariff.docTariffOrders);
  const docFees = useSelector(state => state.tariff.clientDocProcFee);
  const transportationType = useSelector(state => state.transportation.transportationType);
  const countries = useSelector(state => state.phone.phoneCode);
  const [modalUpdateTariff, setModalUpdateTariff] = useState(null);
  const [modalDeleteTariffId, setModalDeleteTariffId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(null);
  const [tableRef, setTableRef] = useState(null);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const tableTabs = useMemo(() => {
    if (!transportationType) return [];
    const country_id = searchParams.get('country_id');
    return transportationType.map(({ label, value }) => ({
      title: label,
      params: {
        transportation_type_id: String(value),
        ...(country_id && { country_id }),
      },
    }));
  }, [transportationType, searchParams]);

  const onTariffDelete = () => {
    setConfirmLoading(true);
    dispatch(deleteDocProcessingFee({ id: modalDeleteTariffId, searchParams })).finally(() => {
      setModalDeleteTariffId(null);
      setConfirmLoading(false);
    });
  };

  useEffect(() => {
    if (!!countries.length && !!transportationType.length) {
      const params = {};
      if (!searchParams.get('country_id')) {
        params['country_id'] = countries[0].id;
      }
      if (!searchParams.get('transportation_type_id')) {
        params['transportation_type_id'] = transportationType[0].value;
      }
      setSearchParams(params, false, { replace: true });
    }
  }, [countries, transportationType]);

  useEffect(() => {
    if (searchParams.get('country_id') && searchParams.get('transportation_type_id')) {
      setLoading(true);
      dispatch(fetchDocProcessingFees(searchParams));
      dispatch(fetchClientDocProcessingFees(searchParams)).finally(() => setLoading(false));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page_size')) {
      setSearchParams({ page_size: 25, page: 1 });
    }
    dispatch(fetchDocTariffOrders());
    dispatch(fetchTransportationType());
    dispatch(fetchPhoneCode());
  }, []);

  return (
    <>
      <TableTabs tabs={tableTabs} keyProp="transportation_type_id" />
      <Box>
        <Table
          row={[{}]}
          rowProps={{ setModalDeleteTariffId, setModalUpdateTariff, tableWrapRef: tableRef }}
          filter={<TableFilter />}
          tableStyle={{ minWidth: 'auto' }}
          theadTabs={countries}
          theadTabKey="country_id"
          RowComponent={Row}
          currentPage={docFees?.page.current_page}
          resultsCount={docFees?.page.results_count}
          loading={loading}
          onWrapRef={setTableRef}
        />
        <ModalAction
          title={t('toDeleteTariff')}
          description={t('toDeleteTariffDescription')}
          isOpen={!!modalDeleteTariffId}
          onCancel={() => setModalDeleteTariffId(false)}
          onSubmit={onTariffDelete}
          submitButtonDisabled={confirmLoading}
        />
        <ModalCreateEditDocProcFee
          mode="edit"
          type={modalUpdateTariff}
          isOpen={!!modalUpdateTariff}
          close={() => setModalUpdateTariff(null)}
        />
      </Box>
    </>
  );
});
