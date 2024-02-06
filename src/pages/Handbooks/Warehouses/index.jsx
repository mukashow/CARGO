import mainStyle from './index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  deleteWarehouses,
  fetchAvailableCashiersWithCurrentWarehouse,
  fetchAvailableManagersWithCurrentWarehouse,
  fetchAvailableStorekeepersWithCurrentWarehouse,
  fetchWarehouse,
  fetchWarehouseList,
  fetchWarehouses,
} from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Icon, ModalAction, Table } from '@/components';
import { useOutsideClick } from '@/hooks';
import { ModalEditWarehouse, TableFilter } from './components';

const HEAD_ROW = [
  'warehouseName',
  'tableDocDate',
  'clientCountry',
  'city',
  'clientAddress',
  'contacts',
  'personnel',
  'inChinese',
  'inRussian',
  'inEnglish',
  'tableDocAction',
];

export const Warehouses = ErrorBoundaryHoc(({ setFieldLabel, setHeadRow }) => {
  const warehouses = useSelector(state => state.warehouse.warehouses);
  const [warehouseModal, setWarehouseModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onWarehouseDelete = async () => {
    setConfirmLoading(true);
    await dispatch(deleteWarehouses({ id: warehouseModal.id, searchParams })).then(() => {
      dispatch(fetchWarehouseList());
    });
    setWarehouseModal(null);
    setConfirmLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchWarehouses(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  return (
    <Box>
      <Table
        loading={loading}
        row={warehouses?.results}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter setFieldLabel={setFieldLabel} />}
        className={mainStyle.table}
        RowComponent={Row}
        rowProps={{ setWarehouseModal }}
        currentPage={warehouses?.page.current_page}
        resultsCount={warehouses?.page.results_count}
      />
      <ModalEditWarehouse
        setFieldLabel={setFieldLabel}
        isOpen={Boolean(warehouseModal?.edit)}
        close={() => setWarehouseModal(null)}
      />
      <ModalAction
        title={t('toDeleteWarehouse')}
        description={t('toDeleteWarehouseDescription')}
        isOpen={Boolean(warehouseModal?.delete)}
        onSubmit={onWarehouseDelete}
        onCancel={() => setWarehouseModal(null)}
        submitButtonDisabled={confirmLoading}
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(({ item, setWarehouseModal }) => {
  const {
    id,
    name,
    country_name,
    city_name,
    address,
    contacts,
    name_zh_hans,
    name_en,
    name_ru,
    created_at,
    worker_count,
  } = item;
  const [actionOpen, setActionOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const ref = useRef();
  useOutsideClick(ref, () => setActionOpen(false));

  const onEditClick = () => {
    setWarehouseModal({ edit: true });
    dispatch(fetchAvailableManagersWithCurrentWarehouse(id));
    dispatch(fetchAvailableCashiersWithCurrentWarehouse(id));
    dispatch(fetchAvailableStorekeepersWithCurrentWarehouse(id));
    dispatch(fetchWarehouse(id));
  };

  return (
    <tr>
      <td className={s.text}>{name}</td>
      <td className={s.text}>{created_at.slice(0, 10)}</td>
      <td className={s.text}>{country_name}</td>
      <td className={s.text}>{city_name}</td>
      <td className={s.text}>{address}</td>
      <td className={s.text}>{contacts}</td>
      <td className={s.text}>{worker_count}</td>
      {i18n.language !== 'zhHans' && <td className={s.text}>{name_zh_hans}</td>}
      {!i18n.language.match(/ru|ru-RU/) && <td className={s.text}>{name_ru}</td>}
      {!i18n.language.match(/en|en-US/) && <td className={s.text}>{name_en}</td>}
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
                  onClick={onEditClick}
                >
                  <Icon iconId="edit" />
                  <span>{t('modalCreateClientEdit')}</span>
                </div>
                <div
                  className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                  onClick={() => setWarehouseModal({ id, delete: true })}
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
});
