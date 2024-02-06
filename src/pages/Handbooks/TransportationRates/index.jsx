import React, { useEffect, useMemo, useState } from 'react';
import handbooksStyle from '../index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, SelectCustom, Table, TableTabs } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  deleteTransportationTariff,
  fetchContractType,
  fetchDirections,
  fetchDirectionsFilter,
  fetchTransportationType,
} from '@/store/actions';
import { useConfirmNavigate, useSearchParamsState } from '@/hooks';
import { Row } from './components/Row';

export const TransportationRates = ErrorBoundaryHoc(({ isCreatingTariff, setIsCreatingTariff }) => {
  const directions = useSelector(state => state.point.directions);
  const directionsFilter = useSelector(state => state.point.directionsFilter);
  const transportationType = useSelector(state => state.transportation.transportationType);
  const [modalDeleteTariffId, setModalDeleteTariffId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(null);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isCreatingTariff);

  const tableTabs = useMemo(() => {
    if (!transportationType) return [];
    const id = searchParams.get('id');
    return transportationType.map(({ label, value }) => ({
      title: label,
      params: {
        transportation_type_id: String(value),
        ...(id && { id }),
        page: 1,
        page_size: 25,
      },
    }));
  }, [transportationType, searchParams]);

  const direction = useMemo(() => {
    if (directionsFilter) {
      const direction = directionsFilter.find(({ id }) => +searchParams.get('id') === id);
      return direction ? { label: direction.name, value: direction.id } : null;
    }
  }, [searchParams, directionsFilter]);

  const onTariffDelete = () => {
    setConfirmLoading(true);
    dispatch(
      deleteTransportationTariff({
        ...modalDeleteTariffId,
        transportationTypeId: searchParams.get('transportation_type_id'),
      })
    )
      .unwrap()
      .finally(() => {
        setModalDeleteTariffId(null);
        setConfirmLoading(false);
      });
  };

  const onReset = () => {
    if (isCreatingTariff) {
      setConfirmCancel({
        func: () => {
          setSearchParams(
            { transportation_type_id: transportationType[0]?.value, page: 1, page_size: 25 },
            true
          );
        },
      });
      return;
    }
    setSearchParams(
      { transportation_type_id: transportationType[0]?.value, page: 1, page_size: 25 },
      true
    );
  };

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
    dispatch(fetchContractType());
    dispatch(fetchDirectionsFilter());
    dispatch(fetchTransportationType());
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchDirections(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('transportation_type_id') && !!transportationType.length) {
      setSearchParams({ transportation_type_id: transportationType[0]?.value }, false, {
        replace: true,
      });
    }
  }, [transportationType]);

  return (
    <>
      <TableTabs
        tabs={tableTabs}
        keyProp="transportation_type_id"
        onTabClick={isCreatingTariff ? func => setConfirmCancel(() => ({ func })) : null}
      />
      <Box>
        <Table
          row={directions?.results}
          currentPage={directions?.page.current_page}
          resultsCount={directions?.page.results_count}
          rowProps={{ setModalDeleteTariffId, setConfirmCancel, setIsCreatingTariff }}
          filter={
            <div className={handbooksStyle.filter} style={{ flexGrow: 1 }}>
              <SelectCustom
                style={{ maxWidth: 250 }}
                labelText={t('directionFilter')}
                floatLabel
                placeholder={null}
                value={direction}
                thin
                onMenuOpen={() => dispatch(fetchDirectionsFilter())}
                options={directionsFilter?.map(({ id, name }) => ({ label: name, value: id }))}
                onChange={({ value }) => setSearchParams({ id: value })}
              />
              <Icon iconId="cleaner" color="#DF3B57" clickable onClick={onReset} />
            </div>
          }
          tableStyle={{ minWidth: 'auto' }}
          headRow={['directionFilter', 'tableDocAction']}
          RowComponent={Row}
          loading={loading}
          emptyMessage={t('tariffIsNotSet')}
          onPaginate={isCreatingTariff ? func => setConfirmCancel(() => ({ func })) : null}
        />
        <ModalAction
          title={t('toDeleteTariff')}
          description={t('toDeleteTariffDescription')}
          isOpen={!!modalDeleteTariffId}
          onCancel={() => setModalDeleteTariffId(false)}
          onSubmit={onTariffDelete}
          submitButtonDisabled={confirmLoading}
        />
        <ModalAction
          isOpen={!!confirmCancel || backModalOpen}
          onCancel={() => {
            setConfirmCancel(null);
            onCancel();
          }}
          onSubmit={() => {
            if (confirmCancel?.func) {
              confirmCancel?.func();
            }
            setConfirmCancel(null);
            setIsCreatingTariff(false);
            backConfirm();
          }}
          title={t('toCancelTariffCreation')}
          description={t('tariffDataWillNotBeSaved')}
        />
      </Box>
    </>
  );
});
