import s from '@pages/Warehouse/index.module.scss';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import { loadClientsAsync } from '@/store/actions';
import dayjs from 'dayjs';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Checkbox, DatePickerRange, Debounce, Icon, SelectCustom } from '@/components';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(({ is_expired = null, hideTags, onClearFilter }) => {
  const orders = useSelector(state => state.warehouse.orders);
  const { filterDirectionList, filterGoodsType, filterTagList, filterStatusList } = useSelector(
    state => ({
      filterDirectionList: state.goods.filterDirectionList,
      filterGoodsType: state.goods.filterGoodsType,
      filterTagList: state.goods.filterTagList,
      filterStatusList: state.goods.filterStatusList,
    })
  );
  const warehouseList = useSelector(state => state.warehouse.warehouseList);
  const roleId = useSelector(state => state.auth.user?.role_id);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { warehouseId } = useParams();
  const { t } = useTranslation();

  const { control, setValue, register, reset } = useForm({
    defaultValues: {
      ordering: null,
      admission_date: searchParams.get('created_date_from')
        ? [
            dayjs(searchParams.get('created_date_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('created_date_to'), 'DD.MM.YYYY').toDate(),
          ]
        : [null, null],
      receiver_code: searchParams.get('receiver_code')
        ? searchParams
            .get('receiver_code')
            .split(',')
            .map(code => ({ label: code }))
        : null,
      direction: null,
      goods_type: null,
      tags: null,
      status: null,
      is_expired: searchParams.get('is_expired') === 'true',
      issued: searchParams.get('issued') === 'false',
      warehouse: null,
      id: searchParams.get('id') || '',
      place_count_min: searchParams.get('place_count_min') || '',
      place_count_max: searchParams.get('place_count_max') || '',
      weight_min: searchParams.get('weight_min') || '',
      weight_max: searchParams.get('weight_max') || '',
      volume_min: searchParams.get('volume_min') || '',
      volume_max: searchParams.get('volume_max') || '',
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
    setFilterValue(filterDirectionList, 'direction');
    setFilterValue(filterGoodsType, 'goods_type');
    setFilterValue(filterTagList, 'tags');
    setFilterValue(filterStatusList, 'status');
    setFilterValue(warehouseList, 'warehouse');
    setValue('is_expired', searchParams.get('is_expired') === 'true');
    setValue('issued', searchParams.get('issued') === 'false');
    setValue('id', searchParams.get('id') || '');
    setValue('place_count_min', searchParams.get('place_count_min') || '');
    setValue('place_count_max', searchParams.get('place_count_max') || '');
    setValue('weight_min', searchParams.get('weight_min') || '');
    setValue('weight_max', searchParams.get('weight_max') || '');
    setValue('volume_min', searchParams.get('volume_min') || '');
    setValue('volume_max', searchParams.get('volume_max') || '');
    setValue(
      'admission_date',
      searchParams.get('created_date_from')
        ? [
            dayjs(searchParams.get('created_date_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('created_date_to'), 'DD.MM.YYYY').toDate(),
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
    filterTagList,
    filterStatusList,
    warehouseList,
    orders,
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
      <div className={s.filter}>
        <div>
          {roleId === 5 && !warehouseId && (
            <SelectCustom
              floatLabel
              labelText={t('warehousePage')}
              isMulti
              control={control}
              name="warehouse"
              style={{ gridColumn: 'span 3' }}
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
            labelText={t('cargoAcceptanceAct')}
            floatLabel
            thin
            type="number"
          />
          <DatePickerRange
            floatLabel
            onChange={date => {
              if (date[0] && date[1]) {
                setSearchParams({
                  created_date_from: dayjs(date[0]).format('DD.MM.YYYY'),
                  created_date_to: dayjs(date[1]).format('DD.MM.YYYY'),
                  page: 1,
                });
              }
            }}
            name="admission_date"
            labelText={t('admissionDateFromTo')}
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
              setSearchParams({ direction: values.map(({ value }) => value).toString(), page: 1 })
            }
            name="direction"
            style={{ gridColumn: 'span 3' }}
            options={filterDirectionList?.map(item => ({
              label: item.name,
              value: item.id,
            }))}
            placeholder={null}
            labelText={t('directionFilter')}
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
          {!hideTags && (
            <SelectCustom
              isMulti
              control={control}
              name="tags"
              onChange={values =>
                setSearchParams({ tags: values.map(({ value }) => value).toString(), page: 1 })
              }
              options={filterTagList?.map(item => ({
                label: item.name,
                value: item.id,
              }))}
              placeholder={null}
              labelText={t('tag')}
              floatLabel
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
          {hideTags && <div />}
          <div className={s.filterGroup}>
            <Debounce
              floatLabel
              thin
              labelText={t('seatsCountFrom')}
              control={control}
              name="place_count_min"
              onChange={e => setSearchParams({ place_count_min: e.target.value, page: 1 })}
              type="number"
            />
            <Debounce
              floatLabel
              thin
              labelText={t('seatsCountTo')}
              control={control}
              name="place_count_max"
              onChange={e => setSearchParams({ place_count_max: e.target.value, page: 1 })}
              type="number"
            />
          </div>
          <div className={s.filterGroup}>
            <Debounce
              floatLabel
              thin
              labelText={t('weightFrom')}
              control={control}
              name="weight_min"
              onChange={e => setSearchParams({ weight_min: e.target.value, page: 1 })}
              type="number"
            />
            <Debounce
              floatLabel
              thin
              labelText={t('weightTo')}
              control={control}
              name="weight_max"
              onChange={e => setSearchParams({ weight_max: e.target.value, page: 1 })}
              type="number"
            />
          </div>
          <div className={s.filterGroup}>
            <Debounce
              floatLabel
              thin
              labelText={t('volumeFrom')}
              control={control}
              name="volume_min"
              onChange={e => setSearchParams({ volume_min: e.target.value, page: 1 })}
              type="number"
            />
            <Debounce
              floatLabel
              thin
              labelText={t('volumeTo')}
              control={control}
              name="volume_max"
              onChange={e => setSearchParams({ volume_max: e.target.value, page: 1 })}
              type="number"
            />
          </div>
        </div>
        <div>
          {is_expired === null && (
            <Checkbox
              thin
              containerStyle={{ gridColumn: 'span 3' }}
              label={t('expiringGoods')}
              register={register}
              name="is_expired"
              onChange={e => setSearchParams({ is_expired: e.target.checked ? true : '', page: 1 })}
            />
          )}
          <Checkbox
            thin
            containerStyle={{ gridColumn: 'span 3' }}
            label={t('onlyNotIssued')}
            register={register}
            name="issued"
            onChange={e => setSearchParams({ issued: e.target.checked ? false : '', page: 1 })}
          />
        </div>
      </div>
      <div>
        <Icon
          iconId="cleaner"
          clickable
          color="#DF3B57"
          onClick={() => {
            reset();
            if (onClearFilter) return onClearFilter();
            setSearchParams({ tab: 'acceptance_certificate', page: 1, page_size: 50 }, true);
          }}
        />
      </div>
    </div>
  );
});
