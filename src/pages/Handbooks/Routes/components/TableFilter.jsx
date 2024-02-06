import s from '../../index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import { fetchFilterRoutes, fetchPointList } from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Button, Icon, SelectCustom } from '@/components';
import { useSearchParamsState } from '@/hooks';
import { ModalCreateEditRoute } from './ModalCreateEditRoute';

export const TableFilter = ErrorBoundaryHoc(() => {
  const { pointList, routesFilter } = useSelector(state => ({
    pointList: state.point.pointList,
    routesFilter: state.point.routesFilter,
  }));
  const [modalCreateRoute, setModalCreateRoute] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const filterValues = useMemo(() => {
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
      point: setParam('point', pointList),
      id: setParam('id', routesFilter),
    };
  }, [pointList, routesFilter, searchParams]);

  useEffect(() => {
    if (!pointList) dispatch(fetchPointList());
  }, [pointList]);

  useEffect(() => {
    if (!routesFilter) dispatch(fetchFilterRoutes());
  }, [routesFilter]);

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreateRoute(true)}
      />
      <div className={s.filter}>
        <SelectCustom
          value={filterValues.point}
          options={pointList?.map(({ id, name }) => ({ value: id, label: name }))}
          thin
          isMulti
          floatLabel
          placeholder={null}
          labelText={t('point')}
          onChange={values => {
            setSearchParams({ point: values.map(({ value }) => value).join(','), page: 1 });
          }}
        />
        <SelectCustom
          value={filterValues.id}
          options={routesFilter?.map(({ id, name }) => ({ value: id, label: name }))}
          thin
          isMulti
          floatLabel
          placeholder={null}
          labelText={uppercase(t('route'))}
          onChange={values => {
            setSearchParams({ id: values.map(({ value }) => value).join(','), page: 1 });
          }}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditRoute isOpen={modalCreateRoute} close={() => setModalCreateRoute(false)} />
    </div>
  );
});
