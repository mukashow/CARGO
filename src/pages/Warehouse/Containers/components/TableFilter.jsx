import s from '@pages/Warehouse/index.module.scss';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { DatePickerRange, Debounce, ErrorBoundaryHoc, Icon, SelectCustom } from '@components';
import { fetchContainersByQuery } from '@actions';
import { useSearchParamsState } from '@hooks';

const selectConf = {
  floatLabel: true,
  placeholder: null,
  thin: true,
  getOptionValue: option => option.id,
  getOptionLabel: option => option.name,
};

export const TableFilter = ErrorBoundaryHoc(() => {
  const warehouseList = useSelector(state => state.warehouse.warehouseList);
  const roleId = useSelector(state => state.auth.user?.role_id);
  const orders = useSelector(state => state.container.orders);
  const warehousesForReturn = useSelector(state => state.container.warehousesForReturn);
  const customsTypes = useSelector(state => state.container.customsTypes);
  const states = useSelector(state => state.container.allContainersState);
  const statuses = useSelector(state => state.container.statuses);
  const warehouseInWayFrom = useSelector(state => state.container.warehouseInWayFrom);
  const warehouseInWayTo = useSelector(state => state.container.warehouseInWayTo);
  const ownershipType = useSelector(state => state.container.ownershipType);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { warehouseId } = useParams();
  const { t } = useTranslation();
  const ref = useRef();

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

  const actualsOptions = useMemo(() => {
    return [
      { name: uppercase(t('yes')), id: 'true' },
      { name: uppercase(t('no')), id: 'false' },
      { name: t('all'), id: '' },
    ];
  }, []);

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
    setValue(
      'return_date',
      searchParams.get('return_at_from')
        ? [
            dayjs(searchParams.get('return_at_from'), 'DD.MM.YYYY').toDate(),
            dayjs(searchParams.get('return_at_to'), 'DD.MM.YYYY').toDate(),
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
    <div className={s.filterWrap}>
      <div className={clsx(s.filterContainer, s.filter)}>
        <div>
          <SelectCustom
            value={setSelectValue(orders, 'ordering', false, true)}
            name="ordering"
            onChange={onSelectChange}
            style={{ gridColumn: 'span 3' }}
            options={orders || []}
            labelText={t('clientFilterSortable')}
            {...selectConf}
          />
          {roleId === 5 && !warehouseId && (
            <SelectCustom
              onChange={onSelectChange}
              isMulti
              labelText={t('warehousePage')}
              name="warehouse"
              style={{ gridColumn: 'span 3' }}
              options={warehouseList || []}
              value={setSelectValue(warehouseList, 'warehouse', true)}
              {...selectConf}
            />
          )}
        </div>
        <div>
          <SelectCustom
            isMulti
            async
            loadOptions={fetchContainersByQuery}
            value={setSelectValue(null, 'number', true)}
            onChange={onSelectChange}
            cacheOptions
            name="number"
            ref={ref}
            style={{ maxWidth: ref.current?.clientWidth }}
            labelText={uppercase(t('containerNumber'))}
            {...selectConf}
          />
          <DatePickerRange
            floatLabel
            control={control}
            name="arriving_date"
            labelText={t('arrivalToWarehouseDate')}
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
          <SelectCustom
            options={ownershipType || []}
            value={setSelectValue(ownershipType, 'property_type')}
            onChange={onSelectChange}
            name="property_type"
            placeholder={null}
            labelText={t('ownershipType')}
            {...selectConf}
          />
          <Debounce
            name="company"
            labelText={t('owner')}
            thin
            floatLabel
            value={searchParams.get('company') || ''}
            onChange={e => setSearchParams({ company: e.target.value, page: 1 })}
          />
          <SelectCustom
            name="container_state"
            isMulti
            options={states || []}
            value={setSelectValue(states, 'container_state', true)}
            onChange={onSelectChange}
            placeholder={null}
            labelText={t('state')}
            {...selectConf}
          />
          <SelectCustom
            options={statuses || []}
            isMulti
            value={setSelectValue(statuses, 'status', true)}
            onChange={onSelectChange}
            name="status"
            placeholder={null}
            labelText={uppercase(t('status'))}
            {...selectConf}
          />
        </div>
        <div>
          <DatePickerRange
            floatLabel
            name="return_date"
            labelText={t('returnDate')}
            thin
            control={control}
            onChange={dates => {
              if (dates[0] && dates[1]) {
                setSearchParams({
                  return_at_from: dayjs(dates[0]).format('DD.MM.YYYY'),
                  return_at_to: dayjs(dates[1]).format('DD.MM.YYYY'),
                  page: 1,
                });
              }
            }}
          />
          <SelectCustom
            name="return_warehouse"
            isMulti
            options={warehousesForReturn || []}
            value={setSelectValue(warehousesForReturn, 'return_warehouse', true)}
            onChange={onSelectChange}
            labelText={t('returnWarehouse')}
            {...selectConf}
          />
          <SelectCustom
            name="custom_clearance_state"
            labelText={t('customsType')}
            options={customsTypes || []}
            value={setSelectValue(customsTypes, 'custom_clearance_state', true, true)}
            onChange={onSelectChange}
            {...selectConf}
          />
          <div className={s.filterGroup}>
            <Debounce
              floatLabel
              thin
              labelText={t('weightFrom')}
              name="max_weight_min"
              value={searchParams.get('max_weight_min') || ''}
              onChange={e => setSearchParams({ max_weight_min: e.target.value, page: 1 })}
              type="number"
            />
            <Debounce
              floatLabel
              thin
              labelText={t('weightTo')}
              name="max_weight_max"
              value={searchParams.get('max_weight_max') || ''}
              onChange={e => setSearchParams({ max_weight_max: e.target.value, page: 1 })}
              type="number"
            />
          </div>
          <div className={s.filterGroup}>
            <Debounce
              floatLabel
              thin
              labelText={t('volumeFrom')}
              name="max_volume_min"
              value={searchParams.get('max_volume_min') || ''}
              onChange={e => setSearchParams({ max_volume_min: e.target.value, page: 1 })}
              type="number"
            />
            <Debounce
              floatLabel
              thin
              labelText={t('volumeTo')}
              name="max_volume_max"
              value={searchParams.get('max_volume_max') || ''}
              onChange={e => setSearchParams({ max_volume_max: e.target.value, page: 1 })}
              type="number"
            />
          </div>
          <SelectCustom
            name="availability"
            labelText={t('actuals')}
            {...selectConf}
            options={actualsOptions}
            onChange={onSelectChange}
            value={setSelectValue(actualsOptions, 'availability', false, true)}
          />
        </div>
        <div>
          <SelectCustom
            options={warehouseInWayFrom || []}
            isMulti
            onChange={onSelectChange}
            value={setSelectValue(warehouseInWayFrom, 'from_warehouse', true)}
            name="from_warehouse"
            labelText={t('inWayFromWarehouse')}
            style={{ gridColumn: 'span 3' }}
            {...selectConf}
          />
          <SelectCustom
            name="to_warehouse"
            options={warehouseInWayTo || []}
            isMulti
            value={setSelectValue(warehouseInWayTo, 'to_warehouse', true)}
            onChange={onSelectChange}
            labelText={t('inWayToWarehouse')}
            style={{ gridColumn: 'span 3' }}
            {...selectConf}
          />
        </div>
      </div>
      <div>
        <Icon
          iconId="cleaner"
          clickable
          color="#DF3B57"
          onClick={() => {
            setSearchParams({ tab: 'containers', page: 1, page_size: 25 }, true);
          }}
        />
      </div>
    </div>
  );
});
