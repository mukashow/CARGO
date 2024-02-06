import mainStyle from '../../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchLoadingListStatus,
  fetchTasksForUnloading,
  fetchTransportationType,
  fetchUnloadingTasksOrders,
} from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Table, TableChain } from '@/components';
import { fetchUnloadingTasksRoutes } from '@actions/loadingList';
import { TableFilter } from './components/TableFilter';

const HEAD_ROW = [
  'number',
  'sendingDate',
  'transportationType',
  'route',
  'driver',
  'carNumber',
  'status',
  'seatsNumber',
  'volume',
  'weight',
];

export const UnloadingTasks = ErrorBoundaryHoc(() => {
  const tasksForUnloading = useSelector(state => state.loadingList.tasksForUnloading);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchTransportationType());
    dispatch(fetchUnloadingTasksRoutes());
    dispatch(fetchUnloadingTasksOrders());
    dispatch(fetchLoadingListStatus());
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchTasksForUnloading(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <Box>
      <Table
        loading={loading}
        row={tasksForUnloading?.results}
        currentPage={tasksForUnloading?.page.current_page}
        resultsCount={tasksForUnloading?.page.results_count}
        RowComponent={Row}
        className={mainStyle.loadingTasksTable}
        headRow={HEAD_ROW}
        filter={<TableFilter />}
        emptyMessage={t('loadingListEmpty')}
        footerTags={
          tasksForUnloading
            ? [
                `${tasksForUnloading.total.loading_list_count} ${t('loadingListsCount')}`,
                `${tasksForUnloading.total.place_count} ${t('seats')}`,
                `${tasksForUnloading.total.weight} ${t('weightKg')}`,
                `${tasksForUnloading.total.volume} ${t('cubicMeter')}`,
              ]
            : []
        }
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: {
      id,
      sent_at,
      transportation_type,
      route,
      driver_name,
      car_number,
      status,
      status_name,
      total,
    },
  }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
      <tr onClick={() => navigate(`/loading_list/${id}`)} className={s.clickable}>
        <td className={s.text}>{id}</td>
        <td className={s.text}>{sent_at?.slice(0, 10)}</td>
        <td className={s.text}>{transportation_type.name}</td>
        <td style={{ maxWidth: 400 }}>
          <TableChain chain={route.map(({ name }) => ({ title: name }))} />
        </td>
        <td className={s.text}>{driver_name}</td>
        <td className={s.text}>{car_number}</td>
        <td className={s.status}>
          <span
            {...(status_name.length > 15 && { style: { whiteSpace: 'break-spaces' } })}
            data-status={status}
            data-status-type="loadingList"
          >
            {status_name}
          </span>
        </td>
        <td className={s.text}>{total.place_count}</td>
        <td className={s.text}>
          {total.volume || 0} {t('cubicMeter')}
        </td>
        <td className={s.text}>
          {total.weight || 0} {t('weightKg')}
        </td>
      </tr>
    );
  }
);
