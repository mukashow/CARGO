import React, { useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { Button, Debounce, Icon } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditCountry } from './ModalCreateEditCountry';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel, expandedCountries }) => {
  const [modalCreateCountry, setModalCreateCountry] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreateCountry(true)}
      />
      <div className={s.filter}>
        <Debounce
          value={searchParams.get('name') || ''}
          onChange={e => setSearchParams({ name: e.target.value, page: 1 })}
          thin
          labelText={t('countryName')}
          floatLabel
        />
        <Debounce
          value={searchParams.get('letter_for_code') || ''}
          onChange={e =>
            setSearchParams({
              letter_for_code: e.target.value.replaceAll(',', '').split('').join(','),
              page: 1,
            })
          }
          thin
          labelText={t('clientCodeLetter')}
          floatLabel
        />
        <Debounce
          value={searchParams.get('phone_code') || ''}
          onChange={e => setSearchParams({ phone_code: e.target.value, page: 1 })}
          thin
          labelText={t('phoneNumberCode')}
          floatLabel
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditCountry
        expandedCountries={expandedCountries}
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateCountry}
        close={() => setModalCreateCountry(false)}
      />
    </div>
  );
});
