import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header, HeaderTabs, LoadingList } from '@/components';
import { AwaitingClearanceLoadingList } from './components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { fetchWarehouseList } from '@/store/actions';
import api from '@/api';

export const BrokerMain = ErrorBoundaryHoc(() => {
  const [total, setTotal] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const tabs = useMemo(() => {
    return [
      {
        title: 'pendingConfirmationSends',
        tab: 'pending_confirmation',
        iconId: 'send',
        iconColor: '#0B6BE6',
        tags: total?.pending
          ? [
              `${total.pending.place_count} ${t('seats')}`,
              `${total.pending.weight} ${t('weightKg')}`,
              `${total.pending.volume} ${t('cubicMeter')}`,
              `${total.pending.loading_list_count} ${t('loadingListsCount')}`,
            ]
          : null,
      },
      {
        title: 'sendsWaitingCustomsClearance',
        tab: 'awaiting_clearance',
        iconId: 'bell-alerts',
        iconColor: '#DF3B57',
        tags: total?.customClearance
          ? [
              `${total.customClearance.place_count} ${t('seats')}`,
              `${total.customClearance.weight} ${t('weightKg')}`,
              `${total.customClearance.volume} ${t('cubicMeter')}`,
              `${total.customClearance.loading_list_count} ${t('loadingListsCount')}`,
            ]
          : null,
      },
    ];
  }, [total]);

  useEffect(() => {
    dispatch(fetchWarehouseList());
    (async () => {
      const { data } = await api('loading-list/waiting-for-broker-approve/');
      setTotal(state => ({ ...state, pending: data.total }));
    })();
    (async () => {
      const { data } = await api('loading-list/custom-clearance-required/');
      setTotal(state => ({ ...state, customClearance: data.total }));
    })();
  }, []);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({
        tab: 'pending_confirmation',
        page: '1',
        page_size: '50',
      });
    }
  }, [searchParams]);

  return (
    <>
      <Header mb={20} />
      <HeaderTabs tabs={tabs} />
      {searchParams.get('tab') === 'pending_confirmation' && <LoadingList />}
      {searchParams.get('tab') === 'awaiting_clearance' && <AwaitingClearanceLoadingList />}
    </>
  );
});
