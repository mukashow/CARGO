import s from '../../../index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Debounce, Icon, SelectCustom } from '@/components';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(() => {
  const transportationType = useSelector(state => state.transportation.transportationType);
  const { routes, statuses, orders } = useSelector(state => ({
    routes: state.loadingList.loadingTasksRoutes,
    orders: state.loadingList.loadingTasksOrders,
    statuses: state.loadingList.filterStatusList,
  }));
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
        <Debounce
          value={searchParams.get('id') || ''}
          onChange={e => setSearchParams({ id: e.target.value, page: 1 })}
          thin
          labelText={uppercase(t('number'))}
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
        onClick={() => setSearchParams({ tab: 'loading_tasks', page: 1, page_size: 25 }, true)}
      />
    </div>
  );
});
