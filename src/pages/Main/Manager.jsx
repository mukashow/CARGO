import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Header, HeaderTabs, ActAcceptanceList } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { AwaitingInventoryActs, AcceptedActs, LoadingTasks, UnloadingTasks } from './components';
import api from '@/api';

export const ManagerMain = ErrorBoundaryHoc(() => {
  const [total, setTotal] = useState(null);
  const expiredTotal = useSelector(state => state.warehouse.acts?.total);
  const tasksForUnloading = useSelector(state => state.loadingList.tasksForUnloading);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const tabs = useMemo(() => {
    return [
      {
        title: 'expiredShipments',
        tab: 'expired',
        additionalSearchParams: { is_expired: 'true' },
        iconId: 'bell-alerts',
        iconColor: '#DF3B57',
        tags: total?.expired
          ? [
              `${total.expired.place_count} ${t(
                total.expired.place_count === 1 ? 'seat' : 'seats'
              )}`,
              `${total.expired.weight} ${t('weightKg')}`,
              `${total.expired.volume} ${t('cubicMeter')}`,
            ]
          : [],
      },
      {
        title: 'urgentShipments',
        tab: 'urgent',
        iconId: 'box',
        iconColor: '#DF3B57',
        additionalSearchParams: { tags: '1' },
        tags: total?.urgent
          ? [
              `${total.urgent.place_count} ${t(total.urgent.place_count === 1 ? 'seat' : 'seats')}`,
              `${total.urgent.weight} ${t('weightKg')}`,
              `${total.urgent.volume} ${t('cubicMeter')}`,
            ]
          : [],
      },
      {
        title: 'inventoryPendingActs',
        tab: 'pending',
        iconId: 'bell-alerts',
        iconColor: '#DF3B57',
      },
      {
        title: 'acceptedActs',
        tab: 'accepted',
        iconId: 'box',
        iconColor: '#DF3B57',
        tags: total?.accepted
          ? [
              `${total.accepted.place_count} ${t(
                total.accepted.place_count === 1 ? 'seat' : 'seats'
              )}`,
              `${total.accepted.weight} ${t('weightKg')}`,
              `${total.accepted.volume} ${t('cubicMeter')}`,
            ]
          : [],
      },
      {
        title: 'loadingTasks',
        tab: 'loading_tasks',
        iconId: 'send',
        iconColor: '#0B6BE6',
        tags: total?.loadingTask
          ? [
              `${total.loadingTask.place_count} ${t('seats')}`,
              `${total.loadingTask.weight} ${t('weightKg')}`,
              `${total.loadingTask.volume} ${t('cubicMeter')}`,
              `${total.loadingTask.loading_list_count} ${t('loadingListsCount')}`,
            ]
          : [],
        additionalSearchParams: { page_size: '25' },
      },
      {
        title: 'tasksForUnloading',
        tab: 'unloading_tasks',
        iconId: 'send',
        iconColor: '#EE8234',
        tags: total?.unloadingTask
          ? [
              `${total.unloadingTask.place_count} ${t('seats')}`,
              `${total.unloadingTask.weight} ${t('weightKg')}`,
              `${total.unloadingTask.volume} ${t('cubicMeter')}`,
              `${total.unloadingTask.loading_list_count} ${t('loadingListsCount')}`,
            ]
          : [],
        additionalSearchParams: { page_size: '25' },
      },
    ];
  }, [expiredTotal, tasksForUnloading, total]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) {
      setSearchParams({
        tab: 'expired',
        page: '1',
        page_size: '50',
        is_expired: 'true',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const { data } = await api(`storekeeper/goods-acceptance-waiting-approve/`);
      setTotal(state => ({ ...state, accepted: data.total }));
    })();
    (async () => {
      const { data } = await api(`loading-list/loading-task/`);
      setTotal(state => ({ ...state, loadingTask: data.total }));
    })();
    (async () => {
      const { data } = await api(`loading-list-for-unloading/`);
      setTotal(state => ({ ...state, unloadingTask: data.total }));
    })();
    (async () => {
      const { data } = await api.get(`warehouse/goods-acceptance/?is_expired=true`);
      setTotal(state => ({ ...state, expired: data.total }));
    })();
    (async () => {
      const { data } = await api.get(`warehouse/goods-acceptance/?tags=1`);
      setTotal(state => ({ ...state, urgent: data.total }));
    })();
  }, []);

  return (
    <>
      <Header mb={20} />
      <HeaderTabs tabs={tabs} />
      {searchParams.get('tab') === 'pending' && <AwaitingInventoryActs />}
      {searchParams.get('tab') === 'accepted' && <AcceptedActs />}
      {searchParams.get('tab') === 'loading_tasks' && <LoadingTasks />}
      {searchParams.get('tab') === 'unloading_tasks' && <UnloadingTasks />}
      {searchParams.get('tab') === 'expired' && (
        <ActAcceptanceList
          is_expired
          onClearFilter={() =>
            setSearchParams({
              tab: 'expired',
              page: '1',
              page_size: '50',
              is_expired: 'true',
            })
          }
        />
      )}
      {searchParams.get('tab') === 'urgent' && (
        <ActAcceptanceList
          hideTags
          onClearFilter={() =>
            setSearchParams({
              tab: 'urgent',
              page: '1',
              page_size: '50',
              tags: '1',
            })
          }
        />
      )}
    </>
  );
});
