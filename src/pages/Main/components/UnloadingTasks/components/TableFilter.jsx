import s from '../../../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import dayjs from 'dayjs';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { DatePickerRange, Debounce, Icon, SelectCustom } from '@/components';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(() => {
  const transportationType = useSelector(state => state.transportation.transportationType);
  const { routes, statuses, orders } = useSelector(state => ({
    routes: state.loadingList.unloadingTasksRoutes,
    orders: state.loadingList.unloadingTasksOrders,
    statuses: state.loadingList.filterStatusList,
  }));
  const [date, setDate] = useState([null, null]);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const setParamFromSearchParams = (prop, arr, isMulti) => {
    const param = searchParams.get(prop) || '';
    if (isMulti) {
      const data =
        arr?.filter(({ id, value }) => param.split(',').includes(String(id || value))) || [];
      return data.map(({ id, name, value, label }) => {
        if (id) {
          return { value: id, label: name };
        }
        return { value, label };
      });
    }
    const data = arr?.find(({ id, value }) => id === param || value === param);

    if (data)
      return {
        value: param,
        label: data.name || data.label,
      };

    return null;
  };

  useEffect(() => {
    const date = searchParams.get('sent_at_from')
      ? [
          dayjs(searchParams.get('sent_at_from'), 'DD.MM.YYYY').toDate(),
          dayjs(searchParams.get('sent_at_to'), 'DD.MM.YYYY').toDate(),
        ]
      : [null, null];
    setDate(date);
  }, [searchParams]);

  return (
    <div className={s.filter} style={{ flexGrow: 1 }}>
      <div className={s.loadingTasksFilter}>
        <SelectCustom
          value={setParamFromSearchParams('ordering', orders)}
          onChange={({ value }) => setSearchParams({ ordering: value })}
          floatLabel
          thin
          labelText={t('clientFilterSortable')}
          placeholder={null}
          options={orders?.map(({ id, name }) => ({ label: name, value: id }))}
        />
        <DatePickerRange
          value={date}
          onChange={date => {
            setDate(date);
            if (date[0] && date[1]) {
              setSearchParams({
                sent_at_from: dayjs(date[0]).format('DD.MM.YYYY'),
                sent_at_to: dayjs(date[1]).format('DD.MM.YYYY'),
                page: 1,
              });
            }
          }}
          labelText={uppercase(t('sendingDate'))}
          placeholder={null}
          floatLabel
          thin
        />
        <Debounce
          value={searchParams.get('goods_acceptance') || ''}
          onChange={e => setSearchParams({ goods_acceptance: e.target.value, page: 1 })}
          thin
          labelText={uppercase(t('actNumber'))}
          floatLabel
        />
        <SelectCustom
          value={setParamFromSearchParams('transportation_type', transportationType, true)}
          onChange={options =>
            setSearchParams({
              transportation_type: options.map(({ value }) => value).join(','),
              page: 1,
            })
          }
          floatLabel
          thin
          labelText={uppercase(t('transportationType')).replace(':', '')}
          placeholder={null}
          options={transportationType}
          isMulti
        />
        <div style={{ width: 300, maxWidth: 'none' }}>
          <SelectCustom
            value={setParamFromSearchParams('route', routes, true)}
            onChange={options =>
              setSearchParams({ route: options.map(({ value }) => value).join(','), page: 1 })
            }
            floatLabel
            thin
            labelText={uppercase(t('route'))}
            placeholder={null}
            options={routes?.map(({ id, name }) => ({ label: name, value: id }))}
            isMulti
          />
        </div>
        <SelectCustom
          value={setParamFromSearchParams('status', statuses, true)}
          onChange={options =>
            setSearchParams({ status: options.map(({ value }) => value).join(','), page: 1 })
          }
          floatLabel
          thin
          labelText={uppercase(t('status'))}
          placeholder={null}
          options={statuses?.map(({ id, name }) => ({ label: name, value: id }))}
          isMulti
        />
        <Debounce
          value={searchParams.get('car_number') || ''}
          onChange={e => setSearchParams({ car_number: e.target.value, page: 1 })}
          thin
          labelText={uppercase(t('carNumber'))}
          floatLabel
        />
      </div>
      <Icon
        iconId="cleaner"
        color="#DF3B57"
        clickable
        onClick={() => setSearchParams({ tab: 'unloading_tasks', page: 1, page_size: 25 }, true)}
      />
    </div>
  );
});
