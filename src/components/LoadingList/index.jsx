import React, { useEffect, useMemo, useState } from 'react';
import s from '@pages/Warehouse/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, TableRow } from './components';
import {
  fetchLoadingList,
  fetchLoadingListGoodsType,
  fetchLoadingListOrders,
  fetchLoadingListRoutes,
  fetchLoadingListStatus,
  fetchTransportationType,
} from '@actions/index';

const HEAD_ROW = [
  'number',
  'sendingDate',
  'transportationType',
  'route',
  'driver',
  'carNumber',
  'seatsNumber',
  'weight',
  'volume',
  'status',
  'tableDocAction',
];

export const LoadingList = ErrorBoundaryHoc(() => {
  const loadingList = useSelector(state => state.loadingList.loadingList);
  const roleId = useSelector(state => state.auth.user?.role_id);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { warehouseId } = useParams();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const footerTags = useMemo(() => {
    return [
      loadingList?.total.loading_list_count +
        ` ${t(
          loadingList?.total.loading_list_count === 1 ? 'loadingList' : 'loadingListsCount'
        ).toLowerCase()}`,
      loadingList?.total.place_count +
        ` ${t(loadingList?.total.place_count === 1 ? 'seat' : 'seats')}`,
      (loadingList?.total.weight || 0) + ` ${t('weightKg')}`,
      (loadingList?.total.volume || 0) + ` ${t('cubicMeter')}`,
    ];
  }, [loadingList]);

  useEffect(() => {
    dispatch(fetchLoadingListStatus());
    dispatch(fetchLoadingListGoodsType({ id: warehouseId }));
    dispatch(fetchLoadingListRoutes({ id: warehouseId }));
    dispatch(fetchTransportationType());
    dispatch(fetchLoadingListOrders());
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchLoadingList({ warehouseId, searchParams })).finally(() => setLoading(false));
  }, [searchParams, pathname]);

  return (
    <Box>
      <Table
        loading={loading}
        className={s.actTable}
        row={loadingList?.result_list}
        currentPage={searchParams.get('page')}
        resultsCount={loadingList?.page?.results_count}
        headRow={
          (roleId === 5 || roleId === 4) && !warehouseId
            ? [...HEAD_ROW.slice(0, 10), 'warehousePage', 'tableDocAction']
            : HEAD_ROW
        }
        filter={<TableFilter />}
        emptyMessage="loadingListEmpty"
        RowComponent={TableRow}
        rowProps={{ roleId, warehouseId }}
        maxHeight={window.innerHeight - 100}
        footerTags={footerTags}
      />
    </Box>
  );
});
