import React from 'react';
import s from './index.module.scss';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const ActionInDetail = ErrorBoundaryHoc(
  ({
    onPreview,
    onEdit,
    onHistory,
    onDelete,
    historyDisabled,
    editDisabled,
    deleteDisabled,
    children,
    ...props
  }) => {
    const { t } = useTranslation();

    return (
      <div className={s.root} {...props}>
        {onPreview && (
          <Button
            green
            value={t('preview')}
            isSmall
            iconLeftId="menu"
            style={{ marginBottom: 20 }}
            onClick={onPreview}
          />
        )}
        <div className={s.icons}>
          {onEdit && (
            <Icon
              iconId="edit"
              color="#0B6BE6"
              clickable={!!onEdit}
              onClick={onEdit}
              disabled={editDisabled}
            />
          )}
          {onHistory && (
            <Icon
              iconId="history"
              color="#0B6BE6"
              clickable={!!onHistory}
              onClick={onHistory}
              disabled={historyDisabled}
            />
          )}
          {onDelete && (
            <Icon
              iconId="trash"
              color="#DF3B57"
              clickable={!!onDelete}
              onClick={onDelete}
              disabled={deleteDisabled}
            />
          )}
        </div>
        {children}
      </div>
    );
  }
);
