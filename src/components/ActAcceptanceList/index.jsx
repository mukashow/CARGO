import React, { useEffect, useState } from 'react';
import s from '@pages/Warehouse/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, TableRow } from './components';
import {
  fetchActAcceptanceOrdering,
  fetchFilterDirectionList,
  fetchFilterGoodsType,
  fetchFilterStatusList,
  fetchFilterTagList,
  fetchGoodsAcceptanceActList,
} from '@actions';

const HEAD_ROW = [
  'actNumber',
  'admissionDate',
  'receiverCodeFilter',
  'seatsNumber',
  'weight',
  'volume',
  'directionFilter',
  'sum',
  'status',
  'note',
  'tableDocAction',
];

export const ActAcceptanceList = ErrorBoundaryHoc(({ is_expired, hideTags, onClearFilter }) => {
  const { actList, page, total } = useSelector(state => ({
    actList: state.warehouse.acts?.goods_acceptance_list,
    page: state.warehouse.acts?.page,
    total: state.warehouse.acts?.total,
  }));
  const roleId = useSelector(state => state.auth.user?.role_id);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { warehouseId } = useParams();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchFilterStatusList());
    dispatch(fetchFilterTagList());
    dispatch(fetchFilterGoodsType());
    dispatch(fetchFilterDirectionList());
    dispatch(fetchActAcceptanceOrdering());
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchGoodsAcceptanceActList({ id: warehouseId, searchParams })).finally(() =>
      setLoading(false)
    );
  }, [searchParams, pathname]);

  return (
    <Box>
      <Table
        loading={loading}
        className={s.actTable}
        row={actList}
        currentPage={searchParams.get('page')}
        resultsCount={page?.results_count}
        headRow={
          roleId === 5 && !warehouseId
            ? [...HEAD_ROW.slice(0, 10), 'warehousePage', 'tableDocAction']
            : HEAD_ROW
        }
        filter={
          <TableFilter is_expired={is_expired} hideTags={hideTags} onClearFilter={onClearFilter} />
        }
        emptyMessage="actsListEmpty"
        RowComponent={TableRow}
        rowProps={{ roleId, warehouseId }}
        maxHeight={window.innerHeight - 100}
        footerTags={[
          total?.place_count + ` ${t(total?.place_count === 1 ? 'seat' : 'seats')}`,
          total?.weight + ` ${t('weightKg')}`,
          total?.volume + ` ${t('cubicMeter')}`,
        ]}
      />
    </Box>
  );
});
