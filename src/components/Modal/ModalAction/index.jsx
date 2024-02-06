import s from './index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ErrorBoundaryHoc, Modal } from '@/components';

export const ModalAction = ErrorBoundaryHoc(
  ({ title, description, isOpen, onSubmit, onCancel, submitButtonDisabled = false }) => {
    const { t } = useTranslation();

    return (
      <Modal isOpen={isOpen} close={onCancel} contentStyle={{ padding: '60px 30px 40px' }}>
        <div className={s.content}>
          {title && <div className={s.title}>{title}</div>}
          <div>
            {description && <div className={s.desc}>{description}</div>}
            <div className={s.gridBtn}>
              <Button value={t('modalConfirmLabelCancel')} textButton onClick={onCancel} />
              <Button
                value={t('modalConfirmLabelConfirm')}
                isBlue
                onClick={onSubmit}
                disabled={submitButtonDisabled}
              />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
);
