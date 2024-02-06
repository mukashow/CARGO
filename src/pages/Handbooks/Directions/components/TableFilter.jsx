import React, { useEffect, useMemo, useState } from 'react';
import s from '../../index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditDirection } from './ModalCreateEditDirection';
import { fetchDirectionsFilter, fetchPointList } from '@/store/actions';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(() => {
  const { pointList, directionsFilter } = useSelector(state => ({
    pointList: state.point.pointList,
    directionsFilter: state.point.directionsFilter,
  }));
  const [modalCreateDirection, setModalCreateDirection] = useState(false);
  const countries = useSelector(state => state.phone.phoneCode);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const filterValues = useMemo(() => {
    const point_from = pointList?.find(({ id }) => id === +searchParams.get('point_from')) || {};
    const point_to = pointList?.find(({ id }) => id === +searchParams.get('point_to')) || {};

    const setParam = (prop, arr) => {
      const params =
        searchParams
          .get(prop)
          ?.split(',')
          .map(value => +value) || [];
      return arr
        ?.filter(({ id }) => params.includes(id))
        .map(({ id, name }) => ({ value: id, label: name }));
    };

    return {
      point_from: { value: point_from.id, label: point_from.name },
      point_to: { value: point_to.id, label: point_to.name },
      custom_clearance_country: setParam('custom_clearance_country', countries),
      id: setParam('id', directionsFilter),
    };
  }, [pointList, countries, directionsFilter, searchParams]);

  useEffect(() => {
    if (!pointList) dispatch(fetchPointList());
  }, [pointList]);

  useEffect(() => {
    if (!directionsFilter) dispatch(fetchDirectionsFilter());
  }, [directionsFilter]);

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreateDirection(true)}
      />
      <div className={s.filter}>
        <SelectCustom
          value={filterValues.point_from}
          options={pointList?.map(({ id, name }) => ({ value: id, label: name }))}
          thin
          floatLabel
          placeholder={null}
          labelText={t('fromPoint')}
          onChange={({ value }) => setSearchParams({ point_from: value, page: 1 })}
        />
        <SelectCustom
          value={filterValues.point_to}
          options={pointList?.map(({ id, name }) => ({ value: id, label: name }))}
          thin
          floatLabel
          placeholder={null}
          labelText={t('toPoint')}
          onChange={({ value }) => setSearchParams({ point_to: value, page: 1 })}
        />
        <SelectCustom
          value={filterValues.custom_clearance_country}
          options={countries?.map(({ id, name }) => ({ value: id, label: name }))}
          thin
          isMulti
          floatLabel
          placeholder={null}
          labelText={t('customCountry')}
          onChange={values =>
            setSearchParams({
              custom_clearance_country: values.map(({ value }) => value).join(','),
              page: 1,
            })
          }
        />
        <SelectCustom
          value={filterValues.id}
          options={directionsFilter?.map(({ id, name }) => ({ value: id, label: name }))}
          thin
          isMulti
          floatLabel
          placeholder={null}
          labelText={t('directionFilter')}
          onChange={values =>
            setSearchParams({ id: values.map(({ value }) => value).join(','), page: 1 })
          }
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditDirection
        isOpen={modalCreateDirection}
        close={() => setModalCreateDirection(false)}
      />
    </div>
  );
});
