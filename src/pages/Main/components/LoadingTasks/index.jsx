import mainStyle from '../../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchLoadingListStatus,
  fetchLoadingTasks,
  fetchLoadingTasksOrders,
  fetchLoadingTasksRoutes,
  fetchTransportationType,
} from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Icon, Table, TableChain } from '@/components';
import { TableFilter } from './components/TableFilter';

const HEAD_ROW = [
  'number',
  'tableDocDate',
  'transportationType',
  'route',
  'driver',
  'carNumber',
  'status',
  'seatsNumber',
  'volume',
  'weight',
];

export const LoadingTasks = ErrorBoundaryHoc(() => {
  const loadingTasks = useSelector(state => state.loadingList.loadingTasks);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchTransportationType());
    dispatch(fetchLoadingTasksRoutes());
    dispatch(fetchLoadingTasksOrders());
    dispatch(fetchLoadingListStatus());
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchLoadingTasks(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <Box>
      <Table
        loading={loading}
        row={loadingTasks?.results}
        currentPage={loadingTasks?.page.current_page}
        resultsCount={loadingTasks?.page.results_count}
        RowComponent={Row}
        className={mainStyle.loadingTasksTable}
        headRow={HEAD_ROW}
        filter={<TableFilter />}
        emptyMessage={t('loadingListEmpty')}
        footerTags={
          loadingTasks
            ? [
                `${loadingTasks.total.place_count} ${t('seats')}`,
                `${loadingTasks.total.weight} ${t('weightKg')}`,
                `${loadingTasks.total.volume} ${t('cubicMeter')}`,
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
      created_at,
      transportation_type,
      route,
      driver_name,
      car_number,
      status_name,
      total,
      status,
    },
  }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
      <tr onClick={() => navigate(`/loading_list/${id}`)} className={s.clickable}>
        <td className={s.text}>{id}</td>
        <td className={s.text}>{created_at.slice(0, 10)}</td>
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
          <div className={s.textFlex}>
            {total.weight || 0} {t('weightKg')}
            <Icon iconId="arrowRight" color="#0B6BE6" style={{ margin: '0 0 0 auto' }} />
          </div>
        </td>
      </tr>
    );
  }
);
