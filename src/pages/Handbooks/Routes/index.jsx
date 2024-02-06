import React, { useEffect, useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import mainStyle from './index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditRoute, TableFilter } from './components';
import {
  deleteRoute,
  fetchFilterRoutes,
  fetchLoadingListRoutes,
  fetchRouteDetail,
  fetchRoutes,
} from '@/store/actions';
import { useOutsideClick } from '@/hooks';

const HEAD_ROW = ['routes', 'tableDocAction'];

export const Routes = ErrorBoundaryHoc(() => {
  const routes = useSelector(state => state.point.routes);
  const [modalUpdateRoute, setModalUpdateRoute] = useState(false);
  const [modalDeleteRouteId, setModalDeleteRouteId] = useState(null);
  const [routeDeleting, setRouteDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onRouteDelete = () => {
    setRouteDeleting(true);
    dispatch(deleteRoute({ id: modalDeleteRouteId, searchParams }))
      .then(() => {
        dispatch(fetchFilterRoutes());
        dispatch(fetchLoadingListRoutes());
      })
      .finally(() => {
        setModalDeleteRouteId(null);
        setRouteDeleting(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchRoutes(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  return (
    <Box>
      <Table
        row={routes?.results}
        rowProps={{ setModalDeleteRouteId, setModalUpdateRoute }}
        headRow={HEAD_ROW}
        filter={<TableFilter />}
        className={mainStyle.tableWrap}
        RowComponent={Row}
        emptyMessage="emptyDirectionsList"
        currentPage={routes?.page.current_page}
        resultsCount={routes?.page.results_count}
        loading={loading}
      />
      <ModalAction
        title={t('toDeleteRoute')}
        description={t('toDeleteRouteDescription')}
        isOpen={!!modalDeleteRouteId}
        onCancel={() => setModalDeleteRouteId(false)}
        onSubmit={onRouteDelete}
        submitButtonDisabled={routeDeleting}
      />
      <ModalCreateEditRoute
        isOpen={modalUpdateRoute}
        close={() => setModalUpdateRoute(false)}
        mode="edit"
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({ item: { id, name }, setModalUpdateRoute, setModalDeleteRouteId }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>{name}</td>
        <td style={{ position: 'relative' }}>
          <div className={s.actionWrap}>
            <div ref={ref}>
              <Icon
                iconClass={s.actionIcon}
                iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                onClick={() => setActionOpen(!actionOpen)}
                clickable
              />
              {actionOpen && (
                <div className={s.actionDropdown} onClick={e => e.stopPropagation()}>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                    onClick={() => {
                      setModalUpdateRoute(true);
                      dispatch(fetchRouteDetail(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setModalDeleteRouteId(id)}
                  >
                    <Icon iconId="trash" />
                    <span>{t('delete')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }
);
