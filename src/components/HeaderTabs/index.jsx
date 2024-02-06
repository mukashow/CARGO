import s from './index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon } from '@/components';

export const HeaderTabs = ErrorBoundaryHoc(({ tabs, variant = 'shadow' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  return (
    <div className={s.tabs}>
      {tabs.map(({ title, tab, additionalSearchParams, iconId, iconColor, tags }) => (
        <div
          key={tab}
          className={clsx(s.tab, searchParams.get('tab') === tab && s.active, s[variant])}
          onClick={() =>
            setSearchParams({ tab, page: '1', page_size: '50', ...additionalSearchParams })
          }
        >
          <div className={s.tabTop}>
            <Icon
              style={{ background: iconColor }}
              iconId={iconId}
              iconClass={s.icon}
              iconHeight={32}
              iconWidth={32}
            />
            <span>{t(title)}</span>
            <Icon iconId="arrowRight" color="#0B6BE6" iconClass={s.arrow} />
          </div>
          {tags && (
            <div className={s.tags}>
              {tags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
