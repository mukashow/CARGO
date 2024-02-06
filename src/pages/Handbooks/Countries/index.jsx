import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  deleteCity,
  deleteCountry,
  fetchCities,
  fetchCountries,
  fetchCountryCities,
  fetchPhoneCode,
} from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, ModalAction, Table } from '@/components';
import { ModalCreateEditCity, ModalCreateEditCountry, Row, TableFilter } from './components';

const HEAD_ROW = [
  'countryName',
  'clientCodeLetter',
  'phoneNumberCode',
  'cityCount',
  'inChinese',
  'inRussian',
  'inEnglish',
  'tableDocAction',
];

export const Countries = ErrorBoundaryHoc(({ setFieldLabel, setHeadRow }) => {
  const countries = useSelector(state => state.country.countries);
  const [editCountryModal, setEditCountryModal] = useState(false);
  const [countryIdToDelete, setCountryIdToDelete] = useState(null);
  const [countryIdToCreateCity, setCountryIdToCreateCity] = useState(null);
  const [countryIdToUpdateCity, setCountryIdToUpdateCity] = useState(null);
  const [cityIdToDelete, setCityIdToDelete] = useState(null);
  const [expandedCountries, setExpandedCountries] = useState([]);
  const [loading, setLoading] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onCountryDelete = () => {
    setConfirmLoading(true);
    dispatch(deleteCountry({ id: countryIdToDelete, searchParams }))
      .then(() => {
        dispatch(fetchPhoneCode());
      })
      .finally(() => {
        expandedCountries.forEach(item => {
          dispatch(fetchCountryCities(item));
        });
        setCountryIdToDelete(null);
        setConfirmLoading(false);
      });
  };

  const onCityDelete = async () => {
    setConfirmLoading(true);
    await dispatch(deleteCity(cityIdToDelete.id));
    await dispatch(fetchCountries(searchParams));
    expandedCountries.forEach(item => {
      dispatch(fetchCountryCities(item));
    });
    dispatch(fetchCities());
    setCityIdToDelete(null);
    setConfirmLoading(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(fetchCountries(searchParams));
      setLoading(false);
    })();
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  return (
    <Box>
      <Table
        filter={<TableFilter setFieldLabel={setFieldLabel} expandedCountries={expandedCountries} />}
        row={countries?.results}
        currentPage={countries?.page.current_page}
        resultsCount={countries?.page.results_count}
        RowComponent={Row}
        rowProps={{
          setEditCountryModal,
          setCountryIdToDelete,
          setCountryIdToCreateCity,
          setCountryIdToUpdateCity,
          setCityIdToDelete,
          setHeadRow,
          setExpandedCountries,
        }}
        loading={loading}
        headRow={setHeadRow(HEAD_ROW)}
        {...(countries && {
          footerTags: [
            `${countries.total.country_count} ${t('countries').toLowerCase()}`,
            `${countries.total.city_count} ${t('citiesCount')}`,
          ],
        })}
        emptyMessage={t('emptyCountries')}
      />
      <ModalCreateEditCountry
        expandedCountries={expandedCountries}
        setFieldLabel={setFieldLabel}
        mode="edit"
        isOpen={editCountryModal}
        close={() => setEditCountryModal(false)}
      />
      <ModalAction
        title={t('toDeleteCountry')}
        description={t('toDeleteCountryDescription')}
        isOpen={!!countryIdToDelete}
        onCancel={() => setCountryIdToDelete(null)}
        onSubmit={onCountryDelete}
        submitButtonDisabled={confirmLoading}
      />
      <ModalAction
        title={t('toDeleteCity')}
        description={t('toDeleteCityDescription')}
        isOpen={!!cityIdToDelete}
        onCancel={() => setCityIdToDelete(null)}
        onSubmit={onCityDelete}
        submitButtonDisabled={confirmLoading}
      />
      <ModalCreateEditCity
        expandedCountries={expandedCountries}
        setFieldLabel={setFieldLabel}
        country={countryIdToCreateCity}
        isOpen={!!countryIdToCreateCity}
        close={() => setCountryIdToCreateCity(null)}
      />
      <ModalCreateEditCity
        expandedCountries={expandedCountries}
        setFieldLabel={setFieldLabel}
        mode="edit"
        country={countryIdToUpdateCity}
        isOpen={!!countryIdToUpdateCity}
        close={() => setCountryIdToUpdateCity(null)}
      />
    </Box>
  );
});
