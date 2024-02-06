import s from '@pages/ActAcceptanceDetail/index.module.scss';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardInformation, FormCard } from '@components';

export const Cards = React.memo(() => {
  const { t } = useTranslation();

  const data = useMemo(() => {
    return [
      [
        { title: `${t('clientCodeClient')}:`, value: 'test' },
        { title: `${t('clientFullName')}:`, value: 'test' },
        { title: `${t('clientPhone')}:`, value: 'test' },
        { title: `${t('modalCreateClientAddress')}:`, value: 'test' },
        { title: `${t('modalCreateClientCompany')}:`, value: 'test' },
      ],
      [
        { title: `${t('acceptanceActs').toLowerCase()}:`, value: ['#55', '#5555'] },
        { title: `${t('seats')}:`, value: 'test' },
        { title: `${t('weight')}:`, value: 'test' },
        { title: `${t('volume')}:`, value: 'test' },
      ],
      [
        { title: `${t('sum')}:`, value: 'test' },
        { title: `${t('paid')}:`, value: 'test' },
        { title: `${t('residue').toLowerCase()}:`, value: 'test' },
      ],
    ];
  }, []);

  return (
    <div className={s.cards}>
      <FormCard cardTitle={t('clientData')}>
        <CardInformation information={data[0]} />
      </FormCard>
      <FormCard cardTitle={t('goodsInInvoice')}>
        <CardInformation information={data[1]} />
      </FormCard>
      <FormCard cardTitle={t('totalsByInvoice')}>
        <CardInformation information={data[2]} />
      </FormCard>
    </div>
  );
});
