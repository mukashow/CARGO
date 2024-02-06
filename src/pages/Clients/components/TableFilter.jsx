import React, { useEffect } from 'react';
import s from '../index.module.scss';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DatePickerRange, Debounce, SelectCustom, Icon } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { loadClientsAsync } from '@/store/actions';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(() => {
  const filters = useSelector(state => state.clients.filters);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParamsState();

  const calendarDefaultValue = (dateStart, dateEnd) => {
    if (!searchParams.get(dateStart) && !searchParams.get(dateEnd)) {
      return [null, null];
    }
    const startStringDateParsed = dayjs(searchParams.get(dateStart), 'DD.MM.YYYY').toDate();
    const endStringDateParsed = dayjs(searchParams.get(dateEnd), 'DD.MM.YYYY').toDate();
    return [startStringDateParsed, endStringDateParsed];
  };

  const { control, reset, setValue } = useForm({
    defaultValues: {
      name: searchParams.get('name'),
      last_name: searchParams.get('last_name'),
      address: searchParams.get('address'),
      company: searchParams.get('company'),
      login: searchParams.get('username'),
      ordering: null,
      code: searchParams.get('code')
        ? searchParams
            .get('code')
            .split(',')
            .map(code => ({ label: code }))
        : null,
      phone: searchParams.get('phone')
        ? searchParams
            .get('phone')
            .split(',')
            .map(code => ({ label: code }))
        : null,
      registration_date_from: calendarDefaultValue(
        'registration_date_from',
        'registration_date_to'
      ),
      username: searchParams.get('username'),
    },
  });

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({
        page: '1',
        page_size: '40',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (filters.orders && searchParams.get('ordering')) {
      const order = filters.orders.find(({ key }) => key === searchParams.get('ordering'));
      setValue('ordering', {
        label: order.value,
        value: order.key,
      });
    }
  }, [filters.orders]);

  return (
    <div className={s.filter}>
      <div className={s.filters}>
        <SelectCustom
          control={control}
          name="ordering"
          onChange={({ value }) => setSearchParams({ ordering: value })}
          options={filters?.orders?.map(item => ({
            label: item.value,
            value: item.key,
          }))}
          labelText={t('clientFilterSortable')}
          placeholder={null}
          floatLabel
          thin
        />
        <SelectCustom
          async
          isMulti
          cacheOptions
          control={control}
          name="code"
          onChange={values =>
            setSearchParams({ code: values.map(({ label }) => label).toString(), page: 1 })
          }
          loadOptions={loadClientsAsync}
          labelText={t('clientFilterCode')}
          placeholder={null}
          floatLabel
          thin
        />
        <SelectCustom
          async
          isMulti
          cacheOptions
          control={control}
          name="phone"
          onChange={values =>
            setSearchParams({
              phone: values.map(({ label }) => label).toString(),
              page: 1,
            })
          }
          loadOptions={value => loadClientsAsync(value, true)}
          labelText={t('phoneNumber')}
          placeholder={null}
          floatLabel
          thin
        />
        <Debounce
          control={control}
          name="name"
          labelText={t('clientFilterName')}
          placeholder={null}
          floatLabel
          onChange={e => setSearchParams({ name: e.target.value, page: 1 })}
          thin
        />
        <Debounce
          control={control}
          name="last_name"
          labelText={t('clientFilterLastName')}
          placeholder={null}
          floatLabel
          onChange={e => setSearchParams({ last_name: e.target.value, page: 1 })}
          thin
        />
        <Debounce
          control={control}
          name="address"
          labelText={t('clientFilterAddress')}
          placeholder={null}
          floatLabel
          onChange={e => setSearchParams({ address: e.target.value, page: 1 })}
          thin
        />
        <Debounce
          control={control}
          name="company"
          labelText={t('clientFilterCompany')}
          placeholder={null}
          floatLabel
          onChange={e => setSearchParams({ company: e.target.value, page: 1 })}
          thin
        />
        <Debounce
          control={control}
          name="username"
          labelText={t('clientFilterUserName')}
          placeholder={null}
          floatLabel
          onChange={e => setSearchParams({ username: e.target.value, page: 1 })}
          thin
        />
        <DatePickerRange
          name="registration_date_from"
          onChange={date => {
            if (date[0] && date[1]) {
              setSearchParams({
                registration_date_from: dayjs(date[0]).format('DD.MM.YYYY'),
                registration_date_to: dayjs(date[1]).format('DD.MM.YYYY'),
                page: 1,
              });
            }
          }}
          labelText={t('clientFilterUserDate')}
          placeholder={null}
          floatLabel
          control={control}
          thin
        />
      </div>
      <div
        className={s.cleaner}
        onClick={() => {
          setSearchParams({ tab: 'clients', page: '1', page_size: '40' }, true);
          reset({
            name: '',
            last_name: '',
            address: '',
            company: '',
            login: '',
            code: '',
            registration_date_from: '',
            phone: '',
            username: '',
          });
        }}
      >
        <Icon iconId="cleaner" />
      </div>
    </div>
  );
});
