import s from '../../../index.module.scss';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import dayjs from 'dayjs';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { DatePickerRange, Debounce, Icon, SelectCustom } from '@/components';
import { loadClientsAsync } from '@actions';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(() => {
  const { acceptedOrders, filterDirectionList } = useSelector(state => ({
    acceptedOrders: state.goods.acceptedOrders,
    filterDirectionList: state.goods.filterDirectionList,
  }));
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParamsState();

  const { control, reset, setValue } = useForm({
    defaultValues: {
      ordering: null,
      id: searchParams.get('id') || '',
      receiver_code: searchParams.get('receiver_code')
        ? searchParams
            .get('receiver_code')
            .split(',')
            .map(code => ({ label: code }))
        : null,
      created_date: searchParams.get('acceptance_date_from')
        ? [
            dayjs(searchParams.get('acceptance_date_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('acceptance_date_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null],
      direction: null,
    },
  });

  useEffect(() => {
    const orders = searchParams.get('ordering');
    if (acceptedOrders && orders) {
      const order = acceptedOrders.find(({ key }) => key === orders);
      return setValue('ordering', {
        label: order.value,
        value: order.key,
      });
    }
    setValue('ordering', null);
  }, [acceptedOrders, searchParams]);

  useEffect(() => {
    const direction = searchParams.get('direction');
    if (filterDirectionList && direction) {
      return setValue(
        'direction',
        direction.split(',').map(paramId => ({
          value: +paramId,
          label: filterDirectionList.find(({ id }) => id === +paramId)?.name,
        }))
      );
    }
    setValue(direction, null);
  }, [filterDirectionList, searchParams]);

  useEffect(() => {
    setValue('id', searchParams.get('id') || '');
    setValue(
      'receiver_code',
      searchParams
        .get('receiver_code')
        ?.split(',')
        .filter(code => !!code)
        .map(code => ({ label: code, value: code })) || null
    );
    setValue(
      'created_date',
      searchParams.get('acceptance_date_from')
        ? [
            dayjs(searchParams.get('acceptance_date_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('acceptance_date_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null]
    );
  }, [searchParams]);

  return (
    <div className={s.filter}>
      <div className={s.filters}>
        <SelectCustom
          control={control}
          name="ordering"
          onChange={({ value }) => setSearchParams({ ordering: value })}
          options={acceptedOrders?.map(item => ({ label: item.value, value: item.key }))}
          labelText={t('clientFilterSortable')}
          placeholder={null}
          floatLabel
          thin
        />
        <Debounce
          control={control}
          name="id"
          labelText={uppercase(t('actNumber'))}
          placeholder={null}
          floatLabel
          onChange={e => setSearchParams({ id: e.target.value, page: 1 })}
          thin
        />
        <DatePickerRange
          name="created_date"
          onChange={date => {
            if (date[0] && date[1]) {
              setSearchParams({
                acceptance_date_from: dayjs(date[0]).format('DD.MM.YYYY'),
                acceptance_date_to: dayjs(date[1]).format('DD.MM.YYYY'),
                page: 1,
              });
            }
          }}
          labelText={uppercase(t('tableDocDate'))}
          placeholder={null}
          floatLabel
          control={control}
          thin
        />
        <SelectCustom
          isMulti
          async
          cacheOptions
          control={control}
          name="receiver_code"
          onChange={values =>
            setSearchParams({ receiver_code: values.map(({ label }) => label).toString(), page: 1 })
          }
          loadOptions={loadClientsAsync}
          labelText={t('clientFilterCode')}
          placeholder={null}
          floatLabel
          thin
        />
        <SelectCustom
          isMulti
          control={control}
          name="direction"
          options={filterDirectionList?.map(({ id, name }) => ({ label: name, value: id }))}
          onChange={values =>
            setSearchParams({ direction: values.map(({ value }) => value).toString(), page: 1 })
          }
          labelText={t('directionFilter')}
          placeholder={null}
          floatLabel
          thin
        />
      </div>
      <div
        className={s.cleaner}
        onClick={() => {
          setSearchParams({ tab: 'accepted', page: '1', page_size: '50' }, true);
          reset();
        }}
      >
        <Icon iconId="cleaner" />
      </div>
    </div>
  );
});
