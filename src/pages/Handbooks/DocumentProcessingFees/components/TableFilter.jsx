import React, { useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Dropdown, Icon, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { useSearchParamsState } from '@/hooks';
import { ModalCreateEditDocProcFee } from './ModalCreateEditDocProcFee';

export const TableFilter = ErrorBoundaryHoc(() => {
  const transportationType = useSelector(state => state.transportation.transportationType);
  const countries = useSelector(state => state.phone.phoneCode);
  const orders = useSelector(state => state.tariff.docTariffOrders);
  const [modalCreateDocProcFee, setModalCreateDocProcFee] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const setOrder = () => {
    const order = orders?.find(({ key }) => key === searchParams.get('ordering'));
    if (order) return { value: order.key, label: order.value };
    return null;
  };

  return (
    <div className={s.filterRoot}>
      <Dropdown
        lightBlue
        iconId="blue-plus"
        iconColor="#0B6BE6"
        buttonTitle="add"
        isOpen={dropdownOpen}
        close={() => setDropdownOpen(false)}
        open={() => setDropdownOpen(true)}
        list={[
          { title: t('add'), onClick: () => setModalCreateDocProcFee('noClient') },
          { title: t('addForClient'), onClick: () => setModalCreateDocProcFee('forClient') },
        ]}
        absolute
        btnStyle={{ paddingRight: 30 }}
      />
      <div className={s.filter}>
        <SelectCustom
          value={setOrder()}
          options={orders?.map(({ key, value }) => ({ label: value, value: key }))}
          onChange={({ value }) => setSearchParams({ ordering: value })}
          labelText={t('clientFilterSortable')}
          thin
          floatLabel
          placeholder={null}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() =>
            setSearchParams(
              {
                transportation_type_id: transportationType[0]?.value,
                country_id: countries[0]?.id,
              },
              true
            )
          }
        />
      </div>
      <ModalCreateEditDocProcFee
        type={modalCreateDocProcFee}
        isOpen={!!modalCreateDocProcFee}
        close={() => setModalCreateDocProcFee(null)}
      />
    </div>
  );
});
