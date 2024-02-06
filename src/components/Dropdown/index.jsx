import React, { useRef } from 'react';
import s from './index.module.scss';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Button } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { useOutsideClick } from '@/hooks';

export const Dropdown = ErrorBoundaryHoc(
  ({
    buttonTitle,
    iconId,
    iconColor,
    list,
    lightBlue,
    isOpen,
    close,
    open,
    className,
    isSmall = false,
    absolute = false,
    btnStyle,
  }) => {
    const { t } = useTranslation();
    const ref = useRef(null);
    useOutsideClick(ref, close);

    return (
      <div
        className={clsx(s.root, lightBlue && s.lightBlue, isOpen && s.active, className)}
        ref={ref}
      >
        <Button
          iconColor={iconColor}
          iconLeftId={iconId}
          value={t(buttonTitle)}
          lightBlue
          style={{ fontSize: 16, color: '#232323', fontWeight: 400, ...btnStyle }}
          onClick={isOpen ? close : open}
          isSmall
        />
        {isOpen && (
          <div className={s.list} data-absolute={absolute} data-small={isSmall}>
            {list?.map(({ title, onClick = () => {}, disabled }) => (
              <p
                style={{ pointerEvents: disabled ? 'none' : 'unset', opacity: disabled ? 0.4 : 1 }}
                key={title}
                onClick={() => {
                  onClick();
                  close();
                }}
              >
                {title}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
);
