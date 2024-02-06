import s from '../../index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import { fetchCities, fetchWaypointsOrdering, fetchWaypointsType } from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Debounce, Dropdown, Icon, SelectCustom } from '@/components';
import { useSearchParamsState } from '@/hooks';
import { ModalCreateEditTerminalPoint } from './ModalCreateEditTerminalPoint';
import { ModalCreateEditWarehousePoint } from './ModalCreateEditWarehousePoint';
import { ModalCreateEditWaypoint } from './ModalCreateEditWaypoint';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel, expandedPoints }) => {
  const { ordering, pointType } = useSelector(state => ({
    ordering: state.point.ordering,
    pointType: state.point.pointType,
  }));
  const countries = useSelector(state => state.phone.phoneCode);
  const cities = useSelector(state => state.country.cities);
  const [modalCreateWaypoint, setModalCreateWaypoint] = useState(false);
  const [modalCreateWarehouseWaypoint, setModalCreateWarehouseWaypoint] = useState(false);
  const [modalCreateTerminalPoint, setModalCreateTerminalPoint] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const filterValues = useMemo(() => {
    const order = ordering?.find(({ key }) => key === searchParams.get('ordering')) || {};
    const point_type = pointType?.find(({ id }) => id === +searchParams.get('point_type')) || {};

    const setParam = (prop, arr) => {
      const param =
        searchParams
          .get(prop)
          ?.split(',')
          .map(id => +id) || [];
      return arr
        ?.filter(({ id }) => param.includes(id))
        .map(({ id, name }) => ({ label: name, value: id }));
    };

    return {
      ordering: { value: order.key, label: order.value },
      point_type: { value: point_type.id, label: point_type.name },
      country: setParam('country', countries),
      city: setParam('city', cities),
    };
  }, [ordering, pointType, cities, countries, searchParams]);

  useEffect(() => {
    if (!ordering) dispatch(fetchWaypointsOrdering());
  }, [ordering]);

  useEffect(() => {
    if (!pointType) dispatch(fetchWaypointsType());
  }, [pointType]);

  useEffect(() => {
    if (!cities) dispatch(fetchCities());
  }, [cities]);

  return (
    <div className={s.filterRoot}>
      <Dropdown
        lightBlue
        iconId="blue-plus"
        iconColor="#0B6BE6"
        buttonTitle="add"
        isOpen={dropdownOpen}
        close={() => setDropdownOpen(false)}
        open={() => setDropdownOpen(true)}
        list={[
          { title: t('aBorderPoint'), onClick: () => setModalCreateWaypoint(true) },
          { title: t('aWarehousePoint'), onClick: () => setModalCreateWarehouseWaypoint(true) },
          { title: t('theTerminalPoint'), onClick: () => setModalCreateTerminalPoint(true) },
        ]}
        absolute
        btnStyle={{ paddingRight: 30 }}
      />
      <div className={s.filter}>
        <SelectCustom
          value={filterValues.ordering}
          options={ordering?.map(({ key, value }) => ({ label: value, value: key }))}
          thin
          floatLabel
          placeholder={null}
          labelText={t('clientFilterSortable')}
          onChange={({ value }) => setSearchParams({ ordering: value, page: 1 })}
        />
        <Debounce
          value={searchParams.get('name') || ''}
          thin
          labelText={t('waypointName')}
          floatLabel
          onChange={e => setSearchParams({ name: e.target.value, page: 1 })}
        />
        <SelectCustom
          value={filterValues.point_type}
          options={pointType?.map(({ id, name }) => ({ label: name, value: id }))}
          thin
          floatLabel
          placeholder={null}
          labelText={t('waypointType')}
          onChange={({ value }) => setSearchParams({ point_type: value, page: 1 })}
        />
        <SelectCustom
          value={filterValues.city}
          options={cities?.map(({ id, name }) => ({ label: name, value: id }))}
          thin
          isMulti
          floatLabel
          placeholder={null}
          labelText={uppercase(t('city'))}
          onChange={values =>
            setSearchParams({ city: values.map(({ value }) => value).join(','), page: 1 })
          }
        />
        <SelectCustom
          value={filterValues.country}
          options={countries.map(({ id, name }) => ({ label: name, value: id }))}
          thin
          isMulti
          floatLabel
          placeholder={null}
          labelText={uppercase(t('clientCountry'))}
          onChange={values =>
            setSearchParams({ country: values.map(({ value }) => value).join(','), page: 1 })
          }
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditWaypoint
        expandedPoints={expandedPoints}
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateWaypoint}
        close={() => setModalCreateWaypoint(false)}
      />
      <ModalCreateEditWarehousePoint
        expandedPoints={expandedPoints}
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateWarehouseWaypoint}
        close={() => setModalCreateWarehouseWaypoint(false)}
      />
      <ModalCreateEditTerminalPoint
        expandedPoints={expandedPoints}
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateTerminalPoint}
        close={() => setModalCreateTerminalPoint(false)}
      />
    </div>
  );
});
