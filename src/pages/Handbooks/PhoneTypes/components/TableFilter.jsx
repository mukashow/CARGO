import React, { useMemo, useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Icon, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditPhoneType } from './ModalCreateEditPhoneType';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel }) => {
  const phoneTypesFilter = useSelector(state => state.phone.phoneTypesFilter);
  const [modalCreatePhoneType, setModalCreatePhoneType] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const phoneTypes = useMemo(() => {
    if (phoneTypesFilter) {
      const type = phoneTypesFilter.find(({ name }) => searchParams.get('name') === name);
      return type ? { label: type.name, value: type.id } : null;
    }
  }, [phoneTypesFilter, searchParams]);

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreatePhoneType(true)}
      />
      <div className={s.filter}>
        <SelectCustom
          style={{ maxWidth: 250 }}
          labelText={t('phoneNumberType')}
          floatLabel
          placeholder={null}
          value={phoneTypes}
          thin
          options={phoneTypesFilter?.map(({ id, name }) => ({ label: name, value: id }))}
          onChange={({ label }) => setSearchParams({ name: label, page: 1 })}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditPhoneType
        setFieldLabel={setFieldLabel}
        isOpen={modalCreatePhoneType}
        close={() => setModalCreatePhoneType(false)}
      />
    </div>
  );
});
