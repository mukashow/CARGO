import React, { useEffect, useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, ModalCreateEditDirection } from './components';
import {
  deleteDirection,
  fetchDirectionDetail,
  fetchDirections,
  fetchDirectionsFilter,
  fetchFilterDirectionList,
  fetchPhoneCode,
} from '@/store/actions';
import { useOutsideClick } from '@/hooks';

const HEAD_ROW = ['direction', 'customCountry', '', '', '', '', 'tableDocAction'];

export const Directions = ErrorBoundaryHoc(() => {
  const directions = useSelector(state => state.point.directions);
  const [modalUpdateDirection, setModalUpdateDirection] = useState(false);
  const [modalDeleteDirectionId, setModalDeleteDirectionId] = useState(null);
  const [directionDeleting, setDirectionDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onDirectionDelete = () => {
    setDirectionDeleting(true);
    dispatch(deleteDirection({ id: modalDeleteDirectionId, searchParams }))
      .then(() => {
        dispatch(fetchDirectionsFilter());
        dispatch(fetchFilterDirectionList());
      })
      .finally(() => {
        setModalDeleteDirectionId(null);
        setDirectionDeleting(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchDirections(searchParams)).finally(() => setLoading(false));
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
        loading={loading}
        row={directions?.results}
        rowProps={{ setModalDeleteDirectionId, setModalUpdateDirection }}
        headRow={window.innerWidth > 1600 ? HEAD_ROW : [...HEAD_ROW.slice(0, 3), HEAD_ROW.at(-1)]}
        filter={<TableFilter />}
        tableStyle={{ minWidth: 'auto' }}
        RowComponent={Row}
        emptyMessage="emptyDirectionsList"
        currentPage={directions?.page.current_page}
        resultsCount={directions?.page.results_count}
      />
      <ModalCreateEditDirection
        isOpen={modalUpdateDirection}
        close={() => setModalUpdateDirection(false)}
        mode="edit"
      />
      <ModalAction
        title={t('toDeleteDirection')}
        description={t('toDeleteDirectionDescription')}
        isOpen={!!modalDeleteDirectionId}
        onCancel={() => setModalDeleteDirectionId(false)}
        onSubmit={onDirectionDelete}
        submitButtonDisabled={directionDeleting}
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: { id, custom_clearance_country, point_from, point_to },
    setModalUpdateDirection,
    setModalDeleteDirectionId,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>
          {point_from.name} - {point_to.name}
        </td>
        <td className={s.text}>{custom_clearance_country?.name}</td>
        {window.innerWidth > 1600 ? (
          <>
            <td />
            <td />
            <td />
            <td />
          </>
        ) : (
          <td />
        )}
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
                      setModalUpdateDirection(true);
                      dispatch(fetchDirectionDetail(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setModalDeleteDirectionId(id)}
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
