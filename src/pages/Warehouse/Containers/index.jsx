import s from '@pages/Warehouse/index.module.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Box, ModalAction, ModalCreateUpdateContainer, Table } from '@/components';
import { declOfNum } from '@/helpers';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  deleteContainer,
  fetchAllContainersState,
  fetchContainerCustomType,
  fetchContainerInWayFromWarehouses,
  fetchContainerInWayToWarehouses,
  fetchContainerOrders,
  fetchContainerOwnershipType,
  fetchContainerStatuses,
  fetchContainers,
  fetchWarehouseList,
  fetchWarehousesForReturn,
} from '@actions';
import { TableFilter, TableRow } from './components';

const containerSynopsis = ['контайнер', 'контейнера', 'контейнеров'];

export const Containers = ErrorBoundaryHoc(() => {
  const containers = useSelector(state => state.container.containers);
  const roleId = useSelector(state => state.auth.user?.role_id);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [deleteContainerModalId, setDeleteContainerModalId] = useState(null);
  const [updateContainerModalId, setUpdateContainerModalId] = useState(null);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { warehouseId } = useParams();
  const { t, i18n } = useTranslation();

  const HEAD_ROW = [
    'containerNumber',
    'arrivalDate',
    'ownershipType',
    'owner',
    'returnDate',
    'returnWarehouse',
    `${t('customsType')} / ${t('state')}`,
    'weight',
    'volume',
    'status',
    'warehouse',
    'tableDocAction',
  ];

  useEffect(() => {
    dispatch(fetchContainerOwnershipType());
    dispatch(fetchWarehousesForReturn());
    dispatch(fetchContainerCustomType());
    dispatch(fetchAllContainersState());
    dispatch(fetchContainerStatuses());
    dispatch(fetchContainerInWayFromWarehouses());
    dispatch(fetchContainerInWayToWarehouses());
    dispatch(fetchContainerOrders());
    if (roleId === 5) {
      dispatch(fetchWarehouseList());
    }
  }, []);

  const fetchContainersMemo = useCallback(() => {
    setLoading(true);
    dispatch(fetchContainers({ searchParams, id: warehouseId })).finally(() => setLoading(false));
  }, [searchParams, warehouseId]);

  const onDeleteContainer = () => {
    setMutating(true);
    dispatch(deleteContainer(deleteContainerModalId))
      .unwrap()
      .then(() => {
        fetchContainersMemo();
        setDeleteContainerModalId(null);
      })
      .finally(() => setMutating(false));
  };

  useEffect(() => {
    fetchContainersMemo();
  }, [searchParams, pathname]);

  return (
    <Box>
      <Table
        loading={loading}
        className={s.actTable}
        row={containers?.result_list}
        currentPage={searchParams.get('page')}
        resultsCount={containers?.page?.results_count}
        headRow={HEAD_ROW}
        filter={<TableFilter />}
        emptyMessage="emptyContainersList"
        RowComponent={TableRow}
        rowProps={{ setUpdateContainerModalId, setDeleteContainerModalId }}
        maxHeight={window.innerHeight - 100}
        footerTags={[
          `${containers?.total?.container_count} ${
            i18n.language.match(/ru|ru-RU/)
              ? declOfNum(containers?.total?.container_count, containerSynopsis)
              : t('containers')
          }`,
          containers?.total?.container_in_warehouse_count + ` ${t('inWarehouse').toLowerCase()}`,
          containers?.total?.weight + ` ${t('weightKg')}`,
          containers?.total?.volume + ` ${t('cubicMeter')}`,
        ]}
      />
      <ModalCreateUpdateContainer
        isOpen={!!updateContainerModalId}
        close={() => setUpdateContainerModalId(null)}
        mode="edit"
        callback={fetchContainersMemo}
        containerId={updateContainerModalId}
      />
      <ModalAction
        isOpen={!!deleteContainerModalId}
        onCancel={() => setDeleteContainerModalId(false)}
        title={t('deleteContainer')}
        description={t('deleteContainerDescription')}
        onSubmit={onDeleteContainer}
        submitButtonDisabled={mutating}
      />
    </Box>
  );
});
