import s from '@pages/Cash/index.module.scss';
import handbookStyle from '@pages/Handbooks/index.module.scss';
import React, { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { uppercase } from '@/helpers';
import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  DatePickerRange,
  Debounce,
  ErrorBoundaryHoc,
  HeaderTabs,
  Icon,
  SelectCustom,
  Table,
} from '@components';
import { fetchContainersByQuery } from '@actions';
import { useSearchParamsState } from '@hooks';

const HEAD_ROW = [
  'tableDocDate',
  'invoiceNumber',
  'clientCodeClient',
  'goodsAcceptanceActs',
  'warehouse',
  'sum',
  'tableClientAction',
];

const selectConf = {
  floatLabel: true,
  placeholder: null,
  thin: true,
  getOptionValue: option => option.id,
  getOptionLabel: option => option.name,
};

const TableFilter = ErrorBoundaryHoc(() => {
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const onSelectChange = useCallback(
    (option, { name }) => {
      const data = Array.isArray(option)
        ? option.map(({ id, name }) => id || name).join(',')
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
      return_date: searchParams.get('return_at_from')
        ? [
            dayjs(searchParams.get('return_at_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('return_at_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null],
    },
  });

  return (
    <div className={clsx(handbookStyle.filter, handbookStyle.minimumGap)} style={{ width: '100%' }}>
      <SelectCustom
        value={setSelectValue([], 'ordering', false, true)}
        name="ordering"
        onChange={onSelectChange}
        options={[] || []}
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
        style={{ minWidth: 160 }}
      />
      <Debounce
        floatLabel
        thin
        labelText={t('invoiceNumber')}
        name="max_weight_min"
        value={searchParams.get('max_weight_min') || ''}
        onChange={e => setSearchParams({ max_weight_min: e.target.value, page: 1 })}
        type="number"
      />
      <SelectCustom
        isMulti
        async
        loadOptions={fetchContainersByQuery}
        value={setSelectValue(null, 'number', true)}
        onChange={onSelectChange}
        cacheOptions
        name="number"
        labelText={uppercase(t('clientCodeClient'))}
        {...selectConf}
      />
      <Debounce
        floatLabel
        thin
        labelText={t('goodsAcceptanceNumber')}
        name="max_weight_min"
        value={searchParams.get('max_weight_min') || ''}
        onChange={e => setSearchParams({ max_weight_min: e.target.value, page: 1 })}
        type="number"
        style={{ minWidth: 140 }}
      />
      <SelectCustom
        value={setSelectValue([], 'ordering', false, true)}
        name="ordering"
        onChange={onSelectChange}
        options={[] || []}
        labelText={t('goodsTypeFilter')}
        {...selectConf}
      />
      <SelectCustom
        value={setSelectValue([], 'ordering', false, true)}
        name="ordering"
        onChange={onSelectChange}
        options={[] || []}
        labelText={t('warehousePage')}
        {...selectConf}
      />
      <Icon
        iconId="cleaner"
        color="#DF3B57"
        clickable
        onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
      />
    </div>
  );
});

export const PartiallyPaidTable = ErrorBoundaryHoc(() => {
  const tabs = useMemo(() => {
    return [
      { title: 'baby', tab: 'test', iconId: 'writePen', iconColor: '#0B6BE6', tags: ['baby'] },
      { title: 'baby', tab: 'testr', iconId: 'clock', iconColor: '#EE8234', tags: ['baby'] },
      { title: 'baby', tab: 'testw', iconId: 'hourglass', iconColor: '#DF3B57', tags: ['baby'] },
    ];
  }, []);

  return (
    <>
      <HeaderTabs variant="border" tabs={tabs} />
      <Table
        rootClass={s.table}
        filter={<TableFilter />}
        headRow={HEAD_ROW}
        row={[1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]}
        RowComponent={Row}
      />
    </>
  );
});

function Row() {
  return (
    <tr>
      <td>baby</td>
    </tr>
  );
}
