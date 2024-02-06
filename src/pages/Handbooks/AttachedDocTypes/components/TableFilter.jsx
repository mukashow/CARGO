import React, { useEffect, useMemo, useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Debounce, Icon, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditDocType } from './ModalCreateEditDocType';
import { useSearchParamsState } from '@/hooks';
import { fetchDocTypeOrders } from '@/store/actions';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel, expandedRowId }) => {
  const orders = useSelector(state => state.documents.orders);
  const [modalCreateDocType, setModalCreateDocType] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const sortBy = useMemo(() => {
    if (orders) {
      const order = orders.find(({ key }) => searchParams.get('ordering') === key);
      return order ? { label: order.value, value: order.key } : null;
    }
  }, [orders, searchParams]);

  useEffect(() => {
    dispatch(fetchDocTypeOrders());
  }, []);

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreateDocType(true)}
      />
      <div className={s.filter}>
        <SelectCustom
          style={{ maxWidth: 250 }}
          labelText={t('clientFilterSortable')}
          floatLabel
          placeholder={null}
          value={sortBy}
          thin
          options={orders?.map(({ key, value }) => ({ label: value, value: key }))}
          onChange={({ value }) => setSearchParams({ ordering: value })}
        />
        <Debounce
          floatLabel
          labelText={t('name')}
          thin
          value={searchParams.get('name') || ''}
          onChange={e => setSearchParams({ name: e.target.value })}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditDocType
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateDocType}
        close={() => setModalCreateDocType(false)}
        expandedRowId={expandedRowId}
      />
    </div>
  );
});
