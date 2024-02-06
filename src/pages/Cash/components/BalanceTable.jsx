import s from '@pages/Cash/index.module.scss';
import React, { useCallback, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { uppercase } from '@/helpers';
import { CashContext } from '@pages/Cash';
import {
  DatePickerRange,
  Debounce,
  ErrorBoundaryHoc,
  Icon,
  SelectCustom,
  Table,
} from '@components';
import { fetchContainersByQuery } from '@actions';
import { useSearchParamsState } from '@hooks';

const HEAD_ROW = [
  'number',
  'tableDocDate',
  'operationType',
  'sum',
  'inCash',
  'warehouse',
  'reportingPerson',
  'assignment',
  'tableDocAction',
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
  const { sidebarOpen, setSidebarOpen } = useContext(CashContext);
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

  return (
    <>
      <div className={s.nounTableFilter}>
        <SelectCustom
          value={setSelectValue([], 'ordering', false, true)}
          name="ordering"
          onChange={onSelectChange}
          options={[] || []}
          labelText={t('clientFilterSortable')}
          {...selectConf}
        />
        <SelectCustom
          value={setSelectValue(null, 'operation_type')}
          onChange={onSelectChange}
          cacheOptions
          name="operation_type"
          labelText={t('operationType')}
          {...selectConf}
        />
        <SelectCustom
          value={setSelectValue(null, 'currency')}
          onChange={onSelectChange}
          cacheOptions
          name="currency"
          labelText={t('currencyWord')}
          {...selectConf}
        />
        <Debounce
          floatLabel
          thin
          labelText={t('parish')}
          name="parish"
          value={searchParams.get('parish') || ''}
          onChange={e => setSearchParams({ parish: e.target.value, page: 1 })}
        />
        <Debounce
          floatLabel
          thin
          labelText={t('expense')}
          name="expense"
          value={searchParams.get('expense') || ''}
          onChange={e => setSearchParams({ expense: e.target.value, page: 1 })}
        />
        <SelectCustom
          value={setSelectValue(null, 'creator')}
          onChange={onSelectChange}
          cacheOptions
          name="creator"
          labelText={uppercase(t('tableDocCreate'))}
          {...selectConf}
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
      </div>
      <div style={{ display: 'grid', gap: 17, alignContent: 'center' }}>
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
        {window.innerWidth <= 1600 && (
          <Icon
            iconId={sidebarOpen ? 'shrink' : 'expand'}
            clickable
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        )}
      </div>
    </>
  );
});

export const BalanceTable = ErrorBoundaryHoc(() => {
  const [detailOpen, setDetailOpen] = useState(true);
  const { control } = useForm({
    defaultValues: {
      period: [null, null],
    },
  });
  const { t } = useTranslation();

  return (
    <>
      <div className={s.balance} data-detail-opened={detailOpen}>
        <div>
          <div className={s.period}>
            <span>{t('nounForPeriod')}</span>
            <DatePickerRange name="period" control={control} noBorder style={{ zIndex: 6 }} />
          </div>
          {detailOpen && (
            <table style={{ marginTop: 24 }}>
              <tbody>
                <tr>
                  <td>
                    <div style={{ marginBottom: 12 }}>
                      <span className={s.title}>{t('warehouse')}</span>{' '}
                      <span className={s.value}>{t('allWarehouses')}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={s.title}>{t('noun')}:</td>
                  <td className={s.value}>500 000 $</td>
                  <td className={s.value}>10 000 000 c</td>
                  <td className={s.value}>10 000 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 000 000 ₸</td>
                </tr>
                <tr>
                  <td className={s.title}>{t('cashes').toLowerCase()}:</td>
                  <td className={s.value}>500 000 $</td>
                  <td className={s.value}>10 000 000 c</td>
                  <td className={s.value}>10 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 000 000 ₸</td>
                </tr>
                <tr>
                  <td className={s.title}>{t('cashless').toLowerCase()}:</td>
                  <td className={s.value}>500 000 $</td>
                  <td className={s.value}>10 000 000 c</td>
                  <td className={s.value}>10 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 000 000 ₸</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div className={s.right}>
          {detailOpen && (
            <table className={s.detailsTable}>
              <thead>
                <tr>
                  <th>
                    <div className={s.mediumTitle}>
                      <Icon
                        iconId="arrow-right-thin"
                        style={{ rotate: '90deg' }}
                        color="#009E61"
                        iconWidth={18}
                        iconHeight={18}
                      />
                      {t('parish')}
                    </div>
                  </th>
                  <th>
                    <div className={s.mediumTitle}>
                      <Icon
                        iconId="arrow-right-thin"
                        style={{ rotate: '-90deg' }}
                        color="#DF3B57"
                        iconWidth={18}
                        iconHeight={18}
                      />
                      {t('expense')}
                    </div>
                  </th>
                  <th>
                    <div className={s.mediumTitle}>
                      <Icon
                        iconId="arrow-right-thin"
                        color="#828282"
                        iconWidth={18}
                        iconHeight={18}
                      />
                      {t('translate')}
                    </div>
                  </th>
                  <th>
                    <div className={s.mediumTitle}>
                      <Icon iconId="cycle" color="#EE8234" />
                      {t('conversion')}
                    </div>
                  </th>
                </tr>
                <tr>
                  <td className={s.value}>10 000 c</td>
                  <td className={s.value}>10 000 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 000 000 ₸</td>
                </tr>
                <tr>
                  <td className={s.value}>10 000 000 c</td>
                  <td className={s.value}>10 000 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 ₸</td>
                </tr>
                <tr>
                  <td className={s.value}>10 000 000 c</td>
                  <td className={s.value}>10 000 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 000 000 ₸</td>
                </tr>
                <tr>
                  <td className={s.value}>10 000 000 c</td>
                  <td className={s.value}>10 000 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 000 000 ₸</td>
                </tr>
                <tr>
                  <td className={s.value}>10 000 000 c</td>
                  <td className={s.value}>10 000 000 ₽</td>
                  <td className={s.value}>10 000 000 ¥</td>
                  <td className={s.value}>1 000 000 000 ₸</td>
                </tr>
              </thead>
            </table>
          )}
          <Icon
            iconId="arrowRight"
            color="#0B6BE6"
            style={{ rotate: detailOpen ? '-90deg' : '90deg' }}
            iconClass={s.detailOpener}
            clickable
            onClick={() => setDetailOpen(!detailOpen)}
          />
        </div>
      </div>
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
