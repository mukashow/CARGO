import s from '@components/Table/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Icon, Table, TableChain } from '@/components';
import { fetchAwaitingInventoryActs, fetchAwaitingInventoryActsOrders } from '@actions/goods';
import { TableFilter } from './components/TableFilter';

const HEAD_ROW = ['actNumber', 'tableDocDate', 'receiverCode', 'route', 'status'];

export const AwaitingInventoryActs = ErrorBoundaryHoc(() => {
  const { page, results, awaitingInventoryOrders } = useSelector(state => ({
    page: state.goods.awaitingInventoryActs?.page,
    results: state.goods.awaitingInventoryActs?.results,
    awaitingInventoryOrders: state.goods.awaitingInventoryOrders,
    filterDirectionList: state.goods.filterDirectionList,
  }));
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    dispatch(fetchAwaitingInventoryActs(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!awaitingInventoryOrders) dispatch(fetchAwaitingInventoryActsOrders());
  }, [awaitingInventoryOrders]);

  return (
    <Box>
      <Table
        loading={loading}
        RowComponent={TableRow}
        headRow={HEAD_ROW}
        row={results}
        currentPage={page?.current_page}
        resultsCount={page?.results_count}
        filter={<TableFilter />}
        emptyMessage="actsListEmpty"
      />
    </Box>
  );
});

const TableRow = ErrorBoundaryHoc(({ item }) => {
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
      <td style={{ maxWidth: 400 }}>
        <TableChain chain={item.direction.name.split(' - ').map(title => ({ title }))} />
      </td>
      <td className={clsx(s.textFlex, s.status)}>
        <span
          {...(item.status.name.length > 15 && { style: { whiteSpace: 'break-spaces' } })}
          data-status={item.status.id}
          data-status-type="goodsAcceptance"
        >
          {item.status.name}
        </span>
        <Icon iconId="arrowRight" color="#0B6BE6" />
      </td>
    </tr>
  );
});
