import handbooksStyle from '../index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteCustomClearanceTariff,
  fetchCustomClearanceTariffGoodsType,
  fetchCustomClearanceTariffOrders,
  fetchCustomClearanceTariffs,
  fetchPhoneCode,
  fetchTransportationType,
} from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Button, Icon, ModalAction, SelectCustom, Table, TableTabs } from '@/components';
import { useSearchParamsState } from '@/hooks';
import { ModalCreateEditTariff, Row } from './components';

export const CustomClearanceFees = ErrorBoundaryHoc(() => {
  const { tariffs, orders } = useSelector(state => ({
    tariffs: state.tariff.customClearanceTariffs,
    orders: state.tariff.customClearanceTariffOrders,
  }));
  const transportationType = useSelector(state => state.transportation.transportationType);
  const countries = useSelector(state => state.phone.phoneCode);
  const [modalUpdateTariff, setModalUpdateTariff] = useState(false);
  const [modalCreateTariff, setModalCreateTariff] = useState(false);
  const [modalDeleteTariffId, setModalDeleteTariffId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(null);
  const [tableRef, setTableRef] = useState(null);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const tableTabs = useMemo(() => {
    if (!transportationType) return [];
    const country = searchParams.get('country');
    return transportationType.map(({ label, value }) => ({
      title: label,
      params: {
        transportation_type: String(value),
        page: 1,
        page_size: 25,
        ...(country && { country }),
      },
    }));
  }, [transportationType, searchParams]);

  const sortBy = useMemo(() => {
    if (orders) {
      const order = orders.find(({ key }) => searchParams.get('ordering') === key);
      return order ? { label: order.value, value: order.key } : null;
    }
  }, [orders, searchParams]);

  const onTariffDelete = () => {
    setConfirmLoading(true);
    dispatch(deleteCustomClearanceTariff({ id: modalDeleteTariffId, searchParams })).finally(() => {
      setModalDeleteTariffId(null);
      setConfirmLoading(false);
    });
  };

  const onReset = () => {
    setSearchParams(
      {
        page: 1,
        page_size: 25,
        country: countries[0]?.id,
        transportation_type: transportationType[0]?.value,
      },
      true
    );
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchCustomClearanceTariffs(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('country') && !!countries.length) {
      setSearchParams({ country: countries[0]?.id }, false, { replace: true });
    }
    if (!searchParams.get('transportation_type') && !!transportationType.length) {
      setSearchParams({ transportation_type: transportationType[0]?.value }, false, {
        replace: true,
      });
    }
  }, [countries, transportationType]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
    dispatch(fetchPhoneCode());
    dispatch(fetchCustomClearanceTariffGoodsType());
    dispatch(fetchTransportationType());
    dispatch(fetchCustomClearanceTariffOrders());
  }, []);

  return (
    <>
      <TableTabs tabs={tableTabs} keyProp="transportation_type" />
      <Box>
        <Table
          row={[{}]}
          rowProps={{
            setModalDeleteTariffId,
            setModalUpdateTariff,
            tariffs: tariffs?.results,
            tableWrapRef: tableRef,
          }}
          onWrapRef={setTableRef}
          filter={
            <div className={handbooksStyle.filterRoot}>
              <Button
                value={t('add')}
                isSmall
                iconColor="#0B6BE6"
                black
                iconLeftId="blue-plus"
                lightBlue
                onClick={() => setModalCreateTariff(true)}
              />
              <div className={handbooksStyle.filter}>
                <SelectCustom
                  style={{ maxWidth: 250 }}
                  labelText={t('clientFilterSortable')}
                  floatLabel
                  placeholder={null}
                  value={sortBy}
                  thin
                  options={orders?.map(({ key, value }) => ({ label: value, value: key }))}
                  onChange={({ value }) => setSearchParams({ ordering: value })}
                />
                <Icon iconId="cleaner" color="#DF3B57" clickable onClick={onReset} />
              </div>
            </div>
          }
          tableStyle={{ minWidth: 'auto' }}
          theadTabs={countries}
          theadTabKey="country"
          RowComponent={Row}
          currentPage={tariffs?.page.current_page}
          resultsCount={tariffs?.page.results_count}
          loading={loading}
        />
        <ModalAction
          title={t('toDeleteTariff')}
          description={t('toDeleteTariffDescription')}
          isOpen={!!modalDeleteTariffId}
          onCancel={() => setModalDeleteTariffId(false)}
          onSubmit={onTariffDelete}
          submitButtonDisabled={confirmLoading}
        />
        <ModalCreateEditTariff
          isOpen={modalCreateTariff}
          close={() => setModalCreateTariff(false)}
        />
        <ModalCreateEditTariff
          isOpen={modalUpdateTariff}
          close={() => setModalUpdateTariff(false)}
          mode="edit"
        />
      </Box>
    </>
  );
});
