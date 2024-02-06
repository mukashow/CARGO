import React, { useEffect, useMemo, useState } from 'react';
import s from '@pages/Warehouse/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, TableRow } from './components';
import {
  fetchAwaitingCustomClearanceLoadingList,
  fetchAwaitingCustomClearanceLoadingListGoodsType,
  fetchAwaitingCustomClearanceLoadingListOrders,
  fetchAwaitingCustomClearanceLoadingListRoutes,
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
  'warehousePage',
];

export const AwaitingClearanceLoadingList = ErrorBoundaryHoc(() => {
  const transportationType = useSelector(state => state.transportation.transportationType);
  const { orders, loadingList } = useSelector(
    state => state.loadingList.awaitingClearanceLoadingList
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const footerTags = useMemo(() => {
    if (!loadingList) return [];
    const { loading_list_count, place_count, weight, volume } = loadingList.total;

    return [
      loading_list_count +
        ` ${t(loading_list_count === 1 ? 'loadingList' : 'loadingListsCount').toLowerCase()}`,
      place_count + ` ${t(place_count === 1 ? 'seat' : 'seats')}`,
      (weight || 0) + ` ${t('weightKg')}`,
      (volume || 0) + ` ${t('cubicMeter')}`,
    ];
  }, [loadingList]);

  useEffect(() => {
    dispatch(fetchAwaitingCustomClearanceLoadingListOrders());
  }, []);

  useEffect(() => {
    if (!transportationType.length) dispatch(fetchTransportationType());
  }, [orders]);

  useEffect(() => {
    dispatch(fetchAwaitingCustomClearanceLoadingListRoutes());
  }, []);

  useEffect(() => {
    dispatch(fetchAwaitingCustomClearanceLoadingListGoodsType());
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchAwaitingCustomClearanceLoadingList(searchParams)).finally(() =>
      setLoading(false)
    );
  }, [searchParams, pathname]);

  return (
    <Box>
      <Table
        loading={loading}
        className={s.actTable}
        row={loadingList?.result_list}
        currentPage={searchParams.get('page')}
        resultsCount={loadingList?.page?.results_count}
        headRow={HEAD_ROW}
        filter={<TableFilter />}
        emptyMessage="loadingListEmpty"
        RowComponent={TableRow}
        maxHeight={window.innerHeight - 100}
        footerTags={footerTags}
      />
    </Box>
  );
});
