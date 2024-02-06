import s from '../../index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import { fetchConsumptionDocType } from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Button, Debounce, Icon, SelectCustom } from '@/components';
import { useSearchParamsState } from '@/hooks';
import { ModalCreateEditConsumptionType } from './ModalCreateEditConsumptionType';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel }) => {
  const docType = useSelector(state => state.documents.consumptionDocType);
  const [modalCreateConsumptionType, setModalCreateConsumptionType] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const docTypeValue = useMemo(() => {
    if (docType) {
      const type = docType.find(({ name }) => searchParams.get('doc_type') === name);
      return type ? { name: type.name, id: type.id } : null;
    }
  }, [docType, searchParams]);

  useEffect(() => {
    dispatch(fetchConsumptionDocType());
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
        onClick={() => setModalCreateConsumptionType(true)}
      />
      <div className={s.filter}>
        <Debounce
          labelText={t('name')}
          floatLabel
          thin
          value={searchParams.get('name') || ''}
          onChange={e => setSearchParams({ name: e.target.value })}
        />
        <SelectCustom
          value={docTypeValue}
          onChange={doc_type => setSearchParams({ doc_type: doc_type.name })}
          labelText={uppercase(t('tableDocType'))}
          floatLabel
          thin
          placeholder={null}
          options={docType || []}
          getOptionValue={option => option.id}
          getOptionLabel={option => option.name}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditConsumptionType
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateConsumptionType}
        close={() => setModalCreateConsumptionType(false)}
      />
    </div>
  );
});
