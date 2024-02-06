import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardInformation, ErrorBoundaryHoc, FormCard, Icon, Modal } from '@/components';

export const ModalViewSeals = ErrorBoundaryHoc(({ isOpen, close }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('allSeals')}
      isOpen={isOpen}
      close={close}
      contentStyle={{ padding: 'clamp(24px, 3.2vw, 40px)', width: 480 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FormCard thin cardStyle={{ position: 'relative' }}>
          <Icon iconId="check" style={{ position: 'absolute', top: 12, right: 24 }} />
          <CardInformation
            information={[
              { title: `${t('seal').toLowerCase()}:`, value: 'plomb' },
              { title: `${t('sealAddedBy').toLowerCase()}:`, value: 'me' },
              { title: `${t('routePoint').toLowerCase()}:`, value: 'me' },
            ]}
          />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#0B6BE6',
              fontSize: 14,
              margin: '24px 0 12px',
              cursor: 'pointer',
            }}
          >
            <Icon iconId="check" />
            {t('makeActive')}
          </div>
        </FormCard>
        <FormCard thin>
          <CardInformation
            information={[
              { title: `${t('seal').toLowerCase()}:`, value: 'plomb' },
              { title: `${t('sealAddedBy').toLowerCase()}:`, value: 'me' },
              { title: `${t('routePoint').toLowerCase()}:`, value: 'me' },
            ]}
          />
        </FormCard>
      </div>
    </Modal>
  );
});
