import React, { useMemo, useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Icon, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditCurrency } from './ModalCreateEditCurrency';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel }) => {
  const allCurrencies = useSelector(state => state.currency.allCurrencies);
  const [modalCreateCurrency, setModalCreateCurrency] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const currency = useMemo(() => {
    if (allCurrencies) {
      const type = allCurrencies.find(({ name }) => searchParams.get('name') === name);
      return type ? { label: type.name, value: type.id } : null;
    }
  }, [allCurrencies, searchParams]);

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreateCurrency(true)}
      />
      <div className={s.filter}>
        <SelectCustom
          style={{ maxWidth: 250 }}
          labelText={t('currencyName')}
          floatLabel
          placeholder={null}
          value={currency}
          thin
          options={allCurrencies}
          onChange={({ label }) => setSearchParams({ name: label, page: 1 })}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditCurrency
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateCurrency}
        close={() => setModalCreateCurrency(false)}
      />
    </div>
  );
});
