import React, { useEffect, useMemo, useState } from 'react';
import s from '../../index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Debounce, Icon, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateWarehouse } from './ModalCreateWarehouse';
import { fetchCities, fetchPhoneCode } from '@/store/actions';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel }) => {
  const countries = useSelector(state => state.phone.phoneCode);
  const cities = useSelector(state => state.country.cities);
  const [modalCreateWarehouse, setModalCreateWarehouse] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const filterValues = useMemo(() => {
    const country = countries?.find(({ id }) => id === +searchParams.get('country')) || {};
    const city = cities?.find(({ id }) => id === +searchParams.get('city')) || {};

    return {
      country: { value: country.id, label: country.name },
      city: { value: city.id, label: city.name },
    };
  }, [countries, cities, searchParams]);

  useEffect(() => {
    dispatch(fetchPhoneCode());
    dispatch(fetchCities());
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
        onClick={() => setModalCreateWarehouse(true)}
      />
      <div className={s.filter}>
        <Debounce
          value={searchParams.get('name') || ''}
          thin
          labelText={t('warehouseName')}
          floatLabel
          onChange={e => setSearchParams({ name: e.target.value, page: 1 })}
        />
        <SelectCustom
          value={filterValues.country}
          options={countries.map(({ id, name }) => ({ label: name, value: id }))}
          thin
          floatLabel
          placeholder={null}
          labelText={t('countryName')}
          onChange={({ value }) => setSearchParams({ country: value, page: 1 })}
        />
        <SelectCustom
          value={filterValues.city}
          options={cities?.map(({ id, name }) => ({ label: name, value: id }))}
          thin
          floatLabel
          placeholder={null}
          labelText={t('cityName')}
          onChange={({ value }) => setSearchParams({ city: value, page: 1 })}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateWarehouse
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateWarehouse}
        close={() => setModalCreateWarehouse(false)}
      />
    </div>
  );
});
