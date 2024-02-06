import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Header, ModalEditClient, Table, TableTabs } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableRow } from './components/TableRow';
import { TableFilter } from './components/TableFilter';
import {
  fetchClient,
  fetchClientCode,
  fetchClientOrders,
  fetchClients,
  fetchPhoneCode,
} from '@/store/actions';

const HEAD_ROW = [
  'tableClientCodeClient',
  'tableClientFullName',
  'tableClientPhone',
  'tableClientLogin',
  'tableClientAddress',
  'tableClientAction',
];

export const Clients = ErrorBoundaryHoc(() => {
  const { clients, page } = useSelector(state => ({
    clients: state.clients.clients,
    page: state.clients.clients?.page,
  }));
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const headerOptions = useMemo(() => {
    if (!page) return [];
    return [`${page.results_count} ${t('tableClients')}`];
  }, [page]);

  const onEditClient = async id => {
    setEditModalOpen(true);
    await dispatch(fetchClient(id));
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchClients(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchClientOrders());
    dispatch(fetchClientCode());
    dispatch(fetchPhoneCode());
  }, []);

  return (
    <>
      <Header />
      <TableTabs tabs={[{ title: 'clients', params: { tab: 'clients' } }]} />
      <Box>
        <Table
          loading={loading}
          RowComponent={TableRow}
          headRow={HEAD_ROW}
          row={clients?.results}
          currentPage={page?.current_page}
          resultsCount={page?.results_count}
          filter={<TableFilter />}
          title={t('tableClientTotal')}
          headerOptions={headerOptions}
          rowProps={{ onEditClient }}
          emptyMessage="emptyTable"
          footerTags={[page?.results_count + ` ${t('tableClients')}`]}
        />
      </Box>
      <ModalEditClient isOpen={editModalOpen} close={() => setEditModalOpen(false)} />
    </>
  );
});
