import s from '@pages/Warehouse/index.module.scss';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { DatePickerRange, Debounce, Icon, SelectCustom } from '@/components';
import { loadClientsAsync } from '@actions/index';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(() => {
  const transportationType = useSelector(state => state.transportation.transportationType);
  const { filterDirectionList, filterGoodsType, filterStatusList, orders } = useSelector(state => ({
    filterDirectionList: state.loadingList.filterDirectionList,
    filterGoodsType: state.loadingList.filterGoodsType,
    filterStatusList: state.loadingList.filterStatusList,
    orders: state.loadingList.orders,
  }));
  const warehouseList = useSelector(state => state.warehouse.warehouseList);
  const roleId = useSelector(state => state.auth.user?.role_id);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { warehouseId } = useParams();
  const { t } = useTranslation();

  const { control, setValue, reset } = useForm({
    defaultValues: {
      ordering: null,
      transportation_type: null,
      sent_at: searchParams.get('sent_at_from')
        ? [
            dayjs(searchParams.get('sent_at_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('sent_at_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null],
      receiver_code: searchParams.get('receiver_code')
        ? searchParams
            .get('receiver_code')
            .split(',')
            .map(code => ({ label: code }))
        : null,
      route: null,
      goods_type: null,
      is_finished: null,
      status: null,
      warehouse: null,
      id: searchParams.get('id') || '',
      car_number: searchParams.get('car_number') || '',
    },
  });

  const setFilterValue = useCallback(
    (data, key) => {
      const params = searchParams.get(key);
      if (data && params) {
        return setValue(
          key,
          params.split(',').map(paramId => ({
            value: +paramId,
            label: data.find(({ id }) => id === +paramId)?.name,
          }))
        );
      }
      setValue(key, null);
    },
    [searchParams]
  );

  useEffect(() => {
    setFilterValue(filterDirectionList, 'route');
    setFilterValue(filterGoodsType, 'goods_type');
    setFilterValue(filterStatusList, 'status');
    setFilterValue(warehouseList, 'warehouse');
    setFilterValue(
      transportationType?.map(({ value, label }) => ({ id: value, name: label })) || null,
      'transportation_type'
    );
    setValue('id', searchParams.get('id') || '');
    setValue('car_number', searchParams.get('car_number') || '');
    setValue(
      'sent_at',
      searchParams.get('sent_at_from')
        ? [
            dayjs(searchParams.get('sent_at_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('sent_at_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null]
    );

    const receiver_code = searchParams.get('receiver_code');
    setValue(
      'receiver_code',
      receiver_code
        ?.split(',')
        .filter(code => !!code)
        .map(code => ({ label: code, value: code })) || null
    );

    const isFinishedOption = [
      { label: t('all'), value: '' },
      { label: t('finished'), value: 'true' },
      { label: t('uncompleted'), value: 'false' },
    ];
    const isFinished = searchParams.get('is_finished');

    if (isFinished !== null) {
      setValue('is_finished', {
        label: isFinishedOption.find(({ value }) => value === isFinished).label,
        value: isFinished,
      });
    } else {
      setValue('is_finished', null);
    }

    const ordering = searchParams.get('ordering');
    if (orders && ordering) {
      return setValue('ordering', {
        label: orders.find(({ key }) => key === ordering)?.value,
        value: ordering,
      });
    }
    setValue('ordering', null);
  }, [
    searchParams,
    filterDirectionList,
    filterGoodsType,
    filterStatusList,
    warehouseList,
    orders,
    transportationType,
  ]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({
        page: '1',
        page_size: '50',
      });
    }
  }, []);

  return (
    <div className={s.filterWrap}>
      <div className={clsx(s.filter, s.short)}>
        <div>
          <SelectCustom
            control={control}
            name="ordering"
            onChange={({ value }) => setSearchParams({ ordering: value })}
            style={{ gridColumn: 'span 3' }}
            options={orders?.map(item => ({
              label: item.value,
              value: item.key,
            }))}
            floatLabel
            placeholder={null}
            labelText={t('clientFilterSortable')}
            thin
          />
        </div>
        <div>
          <Debounce
            control={control}
            name="id"
            onChange={e => setSearchParams({ id: e.target.value, page: 1 })}
            labelText={t('loadingList')}
            floatLabel
            thin
            type="number"
          />
          <DatePickerRange
            floatLabel
            onChange={date => {
              if (date[0] && date[1]) {
                setSearchParams({
                  sent_at_from: dayjs(date[0]).format('DD.MM.YYYY'),
                  sent_at_to: dayjs(date[1]).format('DD.MM.YYYY'),
                  page: 1,
                });
              }
            }}
            name="sent_at"
            labelText={t('sendingDateFromWarehouse')}
            control={control}
            thin
            style={{ minWidth: 160 }}
          />
          <SelectCustom
            isMulti
            async
            cacheOptions
            control={control}
            onChange={values =>
              setSearchParams({
                receiver_code: values.map(({ label }) => label).toString(),
                page: 1,
              })
            }
            name="receiver_code"
            loadOptions={loadClientsAsync}
            placeholder={null}
            floatLabel
            labelText={t('receiverCodeFilter')}
            thin
          />
          <SelectCustom
            isMulti
            control={control}
            onChange={values =>
              setSearchParams({ route: values.map(({ value }) => value).toString(), page: 1 })
            }
            name="route"
            style={{ gridColumn: 'span 3' }}
            options={filterDirectionList?.map(item => ({
              label: item.name,
              value: item.id,
            }))}
            placeholder={null}
            labelText={uppercase(t('route'))}
            floatLabel
            thin
          />
        </div>
        <div>
          <SelectCustom
            isMulti
            control={control}
            name="goods_type"
            onChange={values =>
              setSearchParams({ goods_type: values.map(({ value }) => value).toString(), page: 1 })
            }
            options={filterGoodsType?.map(item => ({
              label: item.name,
              value: item.id,
            }))}
            placeholder={null}
            labelText={t('goodsTypeFilter')}
            floatLabel
            thin
          />
          {(roleId === 5 || roleId === 4) && !warehouseId && (
            <SelectCustom
              floatLabel
              labelText={t('warehousePage')}
              isMulti
              control={control}
              name="warehouse"
              onChange={values =>
                setSearchParams({ warehouse: values.map(({ value }) => value).toString(), page: 1 })
              }
              options={warehouseList?.map(item => ({
                label: item.name,
                value: item.id,
              }))}
              placeholder={null}
              thin
            />
          )}
          <SelectCustom
            isMulti
            control={control}
            name="status"
            onChange={values =>
              setSearchParams({ status: values.map(({ value }) => value).toString(), page: 1 })
            }
            options={filterStatusList?.map(item => ({
              label: item.name,
              value: item.id,
            }))}
            placeholder={null}
            labelText={uppercase(t('status'))}
            floatLabel
            thin
          />
          <SelectCustom
            isMulti
            control={control}
            name="transportation_type"
            onChange={values =>
              setSearchParams({
                transportation_type: values.map(({ value }) => value).toString(),
                page: 1,
              })
            }
            options={transportationType}
            placeholder={null}
            labelText={uppercase(t('transportationType')).replace(/[:。]/g, '')}
            floatLabel
            thin
          />
          <Debounce
            control={control}
            onChange={e => setSearchParams({ car_number: e.target.value, page: 1 })}
            name="car_number"
            labelText={uppercase(t('carNumber'))}
            thin
            floatLabel
          />
          <SelectCustom
            control={control}
            name="is_finished"
            onChange={({ value }) => setSearchParams({ is_finished: value, page: 1 })}
            options={[
              { label: t('all'), value: '' },
              { label: t('finished'), value: 'true' },
              { label: t('uncompleted'), value: 'false' },
            ]}
            placeholder={null}
            labelText={t('finished')}
            floatLabel
            thin
          />
        </div>
      </div>
      <div>
        <Icon
          iconId="cleaner"
          clickable
          color="#DF3B57"
          onClick={() => {
            setSearchParams({ tab: searchParams.get('tab'), page: 1, page_size: 50 }, true);
            reset();
          }}
        />
      </div>
    </div>
  );
});
