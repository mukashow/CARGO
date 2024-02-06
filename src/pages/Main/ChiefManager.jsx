import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header, HeaderTabs, ActAcceptanceList } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import api from '@/api';

export const ChiefManagerMain = ErrorBoundaryHoc(() => {
  const [expiredTotal, setExpiredTotal] = useState(null);
  const [urgentTotal, setUrgentTotal] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { warehouseId } = useParams();

  const expiredTags = useMemo(() => {
    return [
      {
        title: 'expiredShipments',
        tab: 'expired',
        additionalSearchParams: { is_expired: 'true' },
        iconId: 'bell-alerts',
        iconColor: '#DF3B57',
        tags: expiredTotal
          ? [
              `${expiredTotal.place_count} ${t(expiredTotal.place_count === 1 ? 'seat' : 'seats')}`,
              `${expiredTotal.weight} ${t('weightKg')}`,
              `${expiredTotal.volume} ${t('cubicMeter')}`,
            ]
          : [],
      },
      {
        title: 'urgentShipments',
        tab: 'urgent',
        iconId: 'box',
        iconColor: '#DF3B57',
        additionalSearchParams: { tags: '1' },
        tags: urgentTotal
          ? [
              `${urgentTotal.place_count} ${t(urgentTotal.place_count === 1 ? 'seat' : 'seats')}`,
              `${urgentTotal.weight} ${t('weightKg')}`,
              `${urgentTotal.volume} ${t('cubicMeter')}`,
            ]
          : [],
      },
    ];
  }, [expiredTotal, urgentTotal]);

  useEffect(() => {
    (async () => {
      if (!warehouseId) {
        const { data } = await api.get(`goods-acceptance/?is_expired=true`);
        setExpiredTotal(data.total);
      } else {
        const { data } = await api.get(
          `warehouse${warehouseId ? `/${warehouseId}` : ''}/goods-acceptance/?is_expired=true`
        );
        setExpiredTotal(data.total);
      }
    })();
    (async () => {
      if (!warehouseId) {
        const { data } = await api.get(`goods-acceptance/?tags=1`);
        setUrgentTotal(data.total);
      } else {
        const { data } = await api.get(
          `warehouse${warehouseId ? `/${warehouseId}` : ''}/goods-acceptance/?tags=1`
        );
        setUrgentTotal(data.total);
      }
    })();
  }, []);

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

  return (
    <>
      <Header mb={20} />
      <HeaderTabs tabs={expiredTags} />
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
