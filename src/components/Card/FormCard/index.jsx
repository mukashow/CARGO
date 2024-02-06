import s from './index.module.scss';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ErrorBoundaryHoc, ErrorBoundaryHocWithRef } from '@components/ErrorBoundary';
import { Button } from '@/components';

export const FormCard = ErrorBoundaryHocWithRef(
  React.forwardRef(
    (
      {
        topTitle,
        cardTitle,
        className = '',
        containerClassName = '',
        active = false,
        disabled = false,
        index,
        children,
        cardStyle,
        topButton,
        thin,
      },
      ref
    ) => {
      const [isFocused, setIsFocused] = useState(false);
      const { t } = useTranslation();

      return (
        <div
          className={clsx(s.root, containerClassName, (active || isFocused) && s.active)}
          aria-disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
        >
          {topTitle && (
            <div className={s.rootTop}>
              <span>{topTitle}</span>
              {index !== undefined && index !== null && (
                <span>
                  {t('step')} {index + 1}
                </span>
              )}
            </div>
          )}
          <div className={clsx(s.card, className, thin && s.cardThin)} style={cardStyle}>
            {cardTitle && (
              <div className={s.cardTop}>
                <Button value={cardTitle} isStaticTitle className={s.cardTitle} />
                {topButton && (
                  <div onClick={topButton.onClick} className={s.button}>
                    {topButton.title}
                  </div>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      );
    }
  )
);

export const CardInformation = ErrorBoundaryHoc(({ information, className }) => {
  return (
    <div className={clsx(s.informationRoot, className)}>
      {information.map(({ title, value, valueEnd, spaceBetween }) => (
        <div key={title + value} className={clsx(s.informationRow, spaceBetween && s.spaceBetween)}>
          <span className={clsx(s.informationTitle)}>{title}</span>{' '}
          {Array.isArray(value) ? (
            <div className={s.tags}>
              {value.map((text, i) => (
                <span key={i}>{text}</span>
              ))}
            </div>
          ) : (
            <span className={s.cardValue}>
              {value} {valueEnd || ''}
            </span>
          )}
        </div>
      ))}
    </div>
  );
});
