import React, { useMemo } from 'react';
import s from '@pages/ActAcceptanceDetail/index.module.scss';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CardInformation, FormCard } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const Cards = ErrorBoundaryHoc(
  React.memo(() => {
    const container = useSelector(state => state.container.containerOne);
    const { t } = useTranslation();

    const data = useMemo(() => {
      if (!container) return [[], []];
      const {
        number,
        arriving_date,
        warehouse,
        container_state,
        custom_clearance_state,
        weight,
        cost,
        expense_sum,
        property_type,
        return_warehouse,
        return_at,
        company,
      } = container;
      const containerData = [
        { title: `${t('containerNumber')}:`, value: number },
        { title: `${t('arrivalDate').toLowerCase()}:`, value: arriving_date },
        { title: t('warehouse'), value: warehouse?.name },
        { title: `${t('state').toLowerCase()}:`, value: container_state?.name },
        { title: `${t('customsType').toLowerCase()}:`, value: custom_clearance_state?.name },
        { title: `${t('selfWeight').toLowerCase()}:`, value: `${weight} ${t('weightKg')}` },
        { title: `${t('cost').toLowerCase()}:`, value: cost },
        { title: `${t('expense').toLowerCase()}:`, value: expense_sum },
      ];

      const propertyData = [
        {
          title: `${t('ownershipType').toLowerCase()}:`,
          value: property_type?.name,
        },
        { title: `${t('owner').toLowerCase()}:`, value: company },
      ];

      if (property_type.id === 2) {
        propertyData.push(
          {
            title: `${t('returnWarehouse').toLowerCase()}:`,
            value: return_warehouse.name,
          },
          { title: `${t('returnDate').toLowerCase()}:`, value: return_at }
        );
      }

      return [containerData, propertyData];
    }, [container]);

    return (
      <div className={s.cards}>
        <FormCard cardTitle={t('container')}>
          <CardInformation information={data[0]} />
        </FormCard>
        <FormCard cardTitle={t('ownershipType')}>
          <CardInformation information={data[1]} />
        </FormCard>
        <FormCard cardTitle={t('capacity')}>
          <CardInformation
            information={[
              { title: `${t('weight')}:`, value: `${container?.max_weight} ${t('weightKg')}` },
              { title: `${t('volume')}:`, value: `${container?.max_volume} ${t('cubicMeter')}` },
            ]}
          />
        </FormCard>
      </div>
    );
  })
);
