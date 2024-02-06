import React from 'react';
import { useTranslation } from 'react-i18next';
import { uppercase } from '@/helpers';
import { CardInformation, ErrorBoundaryHoc, FormCard, Icon, Modal } from '@/components';

export const ModalViewCar = ErrorBoundaryHoc(({ isOpen, close }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('allAuto')}
      isOpen={isOpen}
      close={close}
      contentStyle={{ padding: '30px', width: '100%' }}
    >
      <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        <FormCard cardStyle={{ position: 'relative', paddingRight: 50 }}>
          <Icon iconId="check" style={{ position: 'absolute', top: 24, right: 24 }} />
          <CardInformation
            information={[
              { title: `${uppercase(t('carAddedBy'))}:`, value: 'car' },
              { title: `${uppercase(t('carNumber'))}:`, value: 'car' },
              { title: `${uppercase(t('carBrand'))}:`, value: 'car' },
              { title: `${uppercase(t('driver'))}:`, value: 'car' },
              { title: `${uppercase(t('clientPhone'))}:`, value: 'car' },
              { title: `${uppercase(t('weight'))}:`, value: 'car' },
              { title: `${uppercase(t('volume'))}:`, value: 'car' },
              { title: `${uppercase(t('routePoint'))}:`, value: 'car' },
            ]}
          />
        </FormCard>
      </div>
    </Modal>
  );
});
