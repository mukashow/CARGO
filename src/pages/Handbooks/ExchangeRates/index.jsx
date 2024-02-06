import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPhoneCode, fetchRates } from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Button, Table } from '@/components';
import { useSearchParamsState } from '@/hooks';
import { ModalSetCourse, Rates } from './components';

export const ExchangeRates = ErrorBoundaryHoc(() => {
  const countries = useSelector(state => state.phone.phoneCode);
  const rates = useSelector(state => state.currency.rates);
  const [modalSetCourse, setModalSetCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const fetchExchangeRates = () => {
    if (searchParams.get('country')) {
      setLoading(true);
      dispatch(fetchRates(searchParams.get('country')))
        .unwrap()
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (!!countries.length) {
      const params = {};
      if (!searchParams.get('country')) {
        params['country'] = countries[0].id;
      }
      setSearchParams(params, false, { replace: true });
    }
  }, [countries]);

  useEffect(() => {
    fetchExchangeRates();
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchPhoneCode());
  }, []);

  return (
    <>
      <Box>
        <Table
          row={!Object.keys(rates || {}).length ? [] : [{}]}
          rowProps={{ fetchExchangeRates }}
          filter={
            <div className={s.filterRoot}>
              <Button
                value={t('setCountryExchangeRate')}
                isSmall
                iconColor="#0B6BE6"
                black
                iconLeftId="blue-plus"
                lightBlue
                onClick={() => setModalSetCourse(true)}
              />
            </div>
          }
          emptyMessage="exchangeRatesListEmpty"
          theadTabs={countries}
          theadTabKey="country"
          RowComponent={() => null}
          loading={loading}
          rootTableStyle={{ minHeight: 'auto', flexGrow: 0 }}
        />
        <Rates />
        <ModalSetCourse
          fetchExchangeRates={fetchExchangeRates}
          isOpen={!!modalSetCourse}
          close={() => setModalSetCourse(null)}
        />
      </Box>
    </>
  );
});
