import mainsStyle from '../../index.module.scss';
import s from '@pages/Handbooks/index.module.scss';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { DatePickerRange, Debounce, ErrorBoundaryHoc, Icon, SelectCustom } from '@components';
import { loadClientsAsync } from '@actions';
import { useSearchParamsState } from '@hooks';

const selectConf = {
  floatLabel: true,
  placeholder: null,
  thin: true,
  getOptionValue: option => option.id,
  getOptionLabel: option => option.name,
};

export const TableFilter = ErrorBoundaryHoc(() => {
  const orders = useSelector(state => state.container.orders);
  const statuses = useSelector(state => state.container.statuses);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const onSelectChange = useCallback(
    (option, { name }) => {
      const data = Array.isArray(option)
        ? option.map(({ id, name, value, label }) => id || value || name || label).join(',')
        : option.id;
      setSearchParams({ [name]: data, page: 1 });
    },
    [setSearchParams]
  );

  const setSelectValue = useCallback(
    (arr, key, isMulti = false, isString = false) => {
      const initKey = searchParams.get(key) || '';
      const transformedKey = isString || isMulti ? initKey : +initKey;

      if (isMulti) {
        const options = transformedKey.toString().split(',');
        return arr
          ? arr?.filter(({ id }) => options.includes(id.toString()))
          : options.filter(text => !!text).map(name => ({ name, id: name }));
      }
      return arr?.find(({ id }) => id === transformedKey) || null;
    },
    [searchParams]
  );

  const { control, setValue } = useForm({
    defaultValues: {
      arriving_date: searchParams.get('arriving_date_from')
        ? [
            dayjs(searchParams.get('arriving_date_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('arriving_date_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null],
    },
  });

  useEffect(() => {
    setValue(
      'arriving_date',
      searchParams.get('arriving_date_from')
        ? [
            dayjs(searchParams.get('arriving_date_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('arriving_date_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null]
    );
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({
        page: '1',
        page_size: '25',
      });
    }
  }, []);

  return (
    <div className={clsx(s.filter, mainsStyle.filter)}>
      <SelectCustom
        value={setSelectValue(orders, 'ordering', false, true)}
        name="ordering"
        onChange={onSelectChange}
        options={orders || []}
        labelText={t('clientFilterSortable')}
        {...selectConf}
      />
      <DatePickerRange
        floatLabel
        control={control}
        name="arriving_date"
        labelText={t('dateFromTo')}
        onChange={dates => {
          if (dates[0] && dates[1]) {
            setSearchParams({
              arriving_date_from: dayjs(dates[0]).format('DD.MM.YYYY'),
              arriving_date_to: dayjs(dates[1]).format('DD.MM.YYYY'),
              page: 1,
            });
          }
        }}
        thin
      />
      <Debounce
        name="bill"
        labelText={t('invoiceNumber')}
        thin
        floatLabel
        value={searchParams.get('company') || ''}
        onChange={e => setSearchParams({ company: e.target.value, page: 1 })}
      />
      <SelectCustom
        isMulti
        async
        loadOptions={loadClientsAsync}
        value={setSelectValue(null, 'number', true)}
        onChange={onSelectChange}
        cacheOptions
        name="number"
        labelText={t('clientFilterCode')}
        {...selectConf}
        getOptionValue={option => option.value}
        getOptionLabel={option => option.label}
      />
      <Debounce
        name="act"
        labelText={t('goodsAcceptanceNumber')}
        thin
        floatLabel
        value={searchParams.get('act') || ''}
        style={{ minWidth: 140 }}
        onChange={e => setSearchParams({ act: e.target.value, page: 1 })}
      />
      <SelectCustom
        options={statuses || []}
        isMulti
        value={setSelectValue(statuses, 'status', true)}
        onChange={onSelectChange}
        name="status"
        placeholder={null}
        labelText={t('goodsTypeFilter')}
        {...selectConf}
      />
      <Icon
        iconId="cleaner"
        clickable
        color="#DF3B57"
        onClick={() => {
          setSearchParams({ tab: 'paying_bill', page: 1, page_size: 25 }, true);
        }}
      />
    </div>
  );
});
