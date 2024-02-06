import React, { useEffect, useState } from 'react';
import s from './index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  TableFilter,
  ModalCreateEditWaypoint,
  ModalCreateEditWarehousePoint,
  Row,
  ModalCreateEditTerminalPoint,
} from './components';
import {
  deleteWaypoint,
  fetchPhoneCode,
  fetchPointList,
  fetchWaypointsAndDirections,
} from '@/store/actions';

const HEAD_ROW = [
  'waypointType',
  'location',
  'waypointName',
  'directionsCount',
  'routesCount',
  'inChinese',
  'inRussian',
  'inEnglish',
  'tableDocAction',
];

export const Waypoints = ErrorBoundaryHoc(({ setFieldLabel, setHeadRow }) => {
  const waypoints = useSelector(state => state.point.waypoints);
  const [modalEditWaypoint, setModalEditWaypoint] = useState(false);
  const [modalEditWarehouseWaypoint, setModalEditWarehouseWaypoint] = useState(false);
  const [modalEditTerminalWaypoint, setModalEditTerminalWaypoint] = useState(false);
  const [deleteWaypointModalId, setDeleteWaypointModalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [expandedPoints, setExpandedPoints] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onWaypointDelete = () => {
    setConfirmLoading(true);
    dispatch(deleteWaypoint({ id: deleteWaypointModalId, searchParams, expandedPoints }))
      .then(() => {
        dispatch(fetchPointList());
      })
      .finally(() => {
        setDeleteWaypointModalId(null);
        setConfirmLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchWaypointsAndDirections(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
    dispatch(fetchPhoneCode());
  }, []);

  return (
    <Box>
      <Table
        row={waypoints?.results}
        rowProps={{
          setDeleteWaypointModalId,
          setModalEditWarehouseWaypoint,
          setModalEditTerminalWaypoint,
          setModalEditWaypoint,
          setExpandedPoints,
          waypointsLength: waypoints?.results.length,
        }}
        className={s.table}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter setFieldLabel={setFieldLabel} expandedPoints={expandedPoints} />}
        RowComponent={Row}
        emptyMessage="emptyWaypointsList"
        currentPage={waypoints?.page.current_page}
        resultsCount={waypoints?.page.results_count}
        loading={loading}
      />
      <ModalCreateEditWaypoint
        expandedPoints={expandedPoints}
        mode="edit"
        isOpen={modalEditWaypoint}
        close={() => setModalEditWaypoint(false)}
        setFieldLabel={setFieldLabel}
      />
      <ModalCreateEditWarehousePoint
        expandedPoints={expandedPoints}
        mode="edit"
        isOpen={modalEditWarehouseWaypoint}
        close={() => setModalEditWarehouseWaypoint(false)}
        setFieldLabel={setFieldLabel}
      />
      <ModalCreateEditTerminalPoint
        expandedPoints={expandedPoints}
        mode="edit"
        isOpen={modalEditTerminalWaypoint}
        close={() => setModalEditTerminalWaypoint(false)}
        setFieldLabel={setFieldLabel}
      />
      <ModalAction
        onSubmit={onWaypointDelete}
        title={t('toDeleteWaypoint')}
        description={t('toDeleteWaypointDescription')}
        isOpen={!!deleteWaypointModalId}
        onCancel={() => setDeleteWaypointModalId(null)}
        submitButtonDisabled={confirmLoading}
      />
    </Box>
  );
});
