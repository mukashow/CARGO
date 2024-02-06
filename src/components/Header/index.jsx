import React from 'react';
import s from './index.module.scss';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/components';
import { ErrorBoundaryHocWithRef } from '@components/ErrorBoundary';

export const Header = ErrorBoundaryHocWithRef(
  React.forwardRef(
    (
      {
        title,
        submitButtonValue,
        additionalSubmitButtonValue,
        onClick,
        buttonDisabled = false,
        onAdditionalClick,
        onCancel,
        className = '',
        mb = 30,
        status,
        statusId,
        statusType,
        statusAuthor = '',
        statusDate = '',
        submitButtonProps = {},
        additionalSubmitButtonProps = {},
        children,
        Buttons,
      },
      ref
    ) => {
      const { name, role, last_name } = useSelector(state => ({
        name: state.auth.user?.name,
        last_name: state.auth.user?.last_name,
        role: state.auth.user?.role_name,
      }));
      const { t } = useTranslation();

      return (
        <div
          style={{ marginBottom: window.innerWidth > 1440 ? mb : mb / 2, position: 'relative' }}
          ref={ref}
        >
          <div className={clsx(s.header, className)}>
            {children}
            {title && (
              <div className={s.left}>
                <h2>{title}</h2>
                {onClick && (
                  <Button
                    value={t(submitButtonValue || 'modalCreateClientCreate')}
                    onClick={onClick}
                    disabled={buttonDisabled}
                    isBlue
                    className={s.button}
                    {...submitButtonProps}
                  />
                )}
                {onAdditionalClick && (
                  <Button
                    value={t(additionalSubmitButtonValue || 'modalCreateClientCreate')}
                    onClick={onAdditionalClick}
                    isBlue
                    className={s.button}
                    {...additionalSubmitButtonProps}
                  />
                )}
                {Buttons}
                {onCancel && (
                  <Button value={t('cancel')} onClick={onCancel} isSmall className={s.button} />
                )}
              </div>
            )}
            <div className={s.user}>
              <div className={s.userIcon}>
                <Icon iconId="user" iconWidth={19} iconHeight={19} />
              </div>
              {name && last_name && (
                <div className={s.username}>
                  {name} {last_name}
                </div>
              )}
              {role && <div className={s.userRole}>{role}</div>}
            </div>
          </div>
          {status && (
            <div className={s.statusRoot}>
              <div className={s.status}>
                <span className={s.statusTitle}>{t('status')}:</span>
                <span data-status={statusId} data-status-type={statusType} className={s.statusName}>
                  {status}
                </span>
              </div>
              <div className={s.statusAuthor}>
                <span>- {statusAuthor}</span>
                <span>{statusDate}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
  )
);
