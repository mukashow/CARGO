import React from 'react';
import s from './index.module.scss';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const TableTabs = ErrorBoundaryHoc(({ tabs, keyProp = 'tab', onTabClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  return (
    <div className={s.root}>
      {tabs.map(({ title, params }) => (
        <p
          key={params[keyProp]}
          className={clsx(s.tabItem, searchParams.get(keyProp) === params[keyProp] && s.active)}
          onClick={() => {
            if (onTabClick) {
              return onTabClick(() => setSearchParams(params));
            }
            setSearchParams(params);
          }}
        >
          {t(title)}
        </p>
      ))}
    </div>
  );
});
