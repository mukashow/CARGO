import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Header, HeaderTabs } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { AwaitingInventoryActs, AcceptedActs, LoadingTasks, UnloadingTasks } from './components';
import { fetchFilterDirectionList } from '@actions/goods';
import api from '@/api';

export const StorekeeperMain = ErrorBoundaryHoc(() => {
  const filterDirectionList = useSelector(state => state.goods.filterDirectionList);
  const [total, setTotal] = useState(null);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const tabs = useMemo(() => {
    return [
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
  }, [total]);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({
        tab: 'pending',
        page: '1',
        page_size: '50',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!filterDirectionList) dispatch(fetchFilterDirectionList());
  }, [filterDirectionList]);

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
  }, []);

  return (
    <>
      <Header mb={20} />
      <HeaderTabs tabs={tabs} />
      {searchParams.get('tab') === 'pending' && <AwaitingInventoryActs />}
      {searchParams.get('tab') === 'accepted' && <AcceptedActs />}
      {searchParams.get('tab') === 'loading_tasks' && <LoadingTasks />}
      {searchParams.get('tab') === 'unloading_tasks' && <UnloadingTasks />}
    </>
  );
});
