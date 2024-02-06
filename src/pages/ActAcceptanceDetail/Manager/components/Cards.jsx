import React, { useMemo } from 'react';
import s from '@pages/ActAcceptanceDetail/index.module.scss';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CardInformation, FormCard } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { getClientInformation } from '@/helpers';

export const Cards = ErrorBoundaryHoc(
  React.memo(() => {
    const goodsDetail = useSelector(state => state.goods.goodsDetail);
    const { t } = useTranslation();

    const generalData = useMemo(() => {
      if (!goodsDetail) return [];
      const {
        transportation_type,
        payer,
        contract_type,
        direction: { point_from_name, point_to_name, custom_clearance_country_name },
        currency,
        insurance_sum,
        warehouse,
        sender,
        receiver,
      } = goodsDetail;

      return [
        { title: t('transportationType'), value: transportation_type.name },
        { title: t('payerParty'), value: receiver.id === payer ? receiver.code : sender?.code },
        { title: t('contractType'), value: contract_type?.name },
        {
          title: t('direction'),
          value: `${point_from_name}-${
            custom_clearance_country_name ? `${custom_clearance_country_name}-` : ''
          }${point_to_name}`,
        },
        { title: t('currency'), value: currency?.name },
        { title: t('insurance'), value: insurance_sum || 0 + ` ${currency?.symbol || ''}` },
        { title: t('warehouse'), value: warehouse.name },
      ];
    }, [goodsDetail]);

    return (
      <div className={s.cards}>
        <FormCard cardTitle={t('receiver')}>
          <CardInformation
            information={[
              { title: t('code'), value: goodsDetail?.receiver.code },
              ...getClientInformation(goodsDetail?.receiver, t),
            ]}
          />
        </FormCard>
        <FormCard cardTitle={t('sender')}>
          <CardInformation
            information={[
              { title: t('code'), value: goodsDetail?.sender?.code },
              ...getClientInformation(goodsDetail?.sender, t),
            ]}
          />
        </FormCard>
        <FormCard cardTitle={t('generalData')}>
          <CardInformation information={generalData} />
        </FormCard>
      </div>
    );
  })
);
