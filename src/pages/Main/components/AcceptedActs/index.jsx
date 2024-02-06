import mainStyle from '../../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Icon, Table, TableChain } from '@/components';
import { fetchAcceptedActs, fetchAcceptedActsOrders } from '@actions/goods';
import { TableFilter } from './components/TableFilter';

const HEAD_ROW = [
  'actNumber',
  'tableDocDate',
  'receiverCode',
  'seatsNumber',
  'weight',
  'volume',
  'route',
  'status',
];

export const AcceptedActs = ErrorBoundaryHoc(() => {
  const { page, results, acceptedOrders, total } = useSelector(state => ({
    page: state.goods.acceptedActs?.page,
    results: state.goods.acceptedActs?.goods_acceptance_list,
    total: state.goods.acceptedActs?.total,
    filterDirectionList: state.goods.filterDirectionList,
    acceptedOrders: state.goods.acceptedOrders,
  }));
  const [loading, setLoading] = useState(null);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    dispatch(fetchAcceptedActs(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!acceptedOrders) dispatch(fetchAcceptedActsOrders());
  }, [acceptedOrders]);

  return (
    <Box>
      <Table
        loading={loading}
        className={mainStyle.acceptedTable}
        RowComponent={TableRow}
        headRow={HEAD_ROW}
        row={results}
        currentPage={page?.current_page}
        resultsCount={page?.results_count}
        filter={<TableFilter />}
        headerOptions={[]}
        emptyMessage="actsListEmpty"
        footerTags={
          total
            ? [
                `${total.place_count} ${t(total.place_count === 1 ? 'seat' : 'seats')}`,
                `${total.weight} ${t('weightKg')}`,
                `${total.volume} ${t('cubicMeter')}`,
              ]
            : []
        }
      />
    </Box>
  );
});

const TableRow = ErrorBoundaryHoc(({ item }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <tr onClick={() => navigate(`/goods_act_acceptance/${item.id}`)} className={s.clickable}>
      <td>
        <div className={s.text}>#{item.id}</div>
      </td>
      <td>
        <div className={s.text}>{item.created_at.slice(0, 10)}</div>
      </td>
      <td>
        <div className={s.text}>{item.receiver.code}</div>
      </td>
      <td>
        <div className={s.text}>{item.place_count}</div>
      </td>
      <td>
        <div className={s.text}>
          {item.weight || 0} {t('weightKg')}
        </div>
      </td>
      <td>
        <div className={s.text}>
          {item.volume || 0} {t('cubicMeter')}
        </div>
      </td>
      <td style={{ maxWidth: 400 }}>
        <TableChain chain={item.direction.name.split(' - ').map(title => ({ title }))} />
      </td>
      <td>
        <div className={clsx(s.textFlex, s.status)} style={{ justifyContent: 'space-between' }}>
          <span
            {...(item.status.name.length > 15 && { style: { whiteSpace: 'break-spaces' } })}
            data-status={item.status.id}
            data-status-type="goodsAcceptance"
          >
            {item.status.name}
          </span>
          <Icon iconId="arrowRight" color="#0B6BE6" />
        </div>
      </td>
    </tr>
  );
});
