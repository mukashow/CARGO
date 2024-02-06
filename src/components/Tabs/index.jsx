import s from './index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Button, Icon } from '@/components';

export const Tabs = ErrorBoundaryHoc(({ tabs, activeTab, setActiveTab = () => {}, onTabClick }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(s.tabs, tabs.length === 1 && s.alone)}>
      {tabs.map(({ title, tags = [], onButtonClick, buttonTitle }) => (
        <div
          key={title}
          className={clsx(s.root, title === activeTab ? s.active : s.nonActive)}
          onClick={() =>
            !!onTabClick && activeTab !== title
              ? onTabClick(() => setActiveTab(title))
              : setActiveTab(title)
          }
          style={{ cursor: activeTab === title ? 'default' : 'pointer' }}
        >
          <div className={s.header}>
            <h3 className={s.title}>
              <Icon iconId="arrowRight" iconClass={s.icon} />
              {t(title)}
            </h3>
            {onButtonClick && (
              <Button
                value={t(buttonTitle)}
                isSmall
                isBlue
                onClick={onButtonClick}
                style={{ pointerEvents: title !== activeTab ? 'none' : 'unset' }}
              />
            )}
          </div>
          {!!tags.length && title === activeTab && (
            <div className={s.tags}>
              {tags.map((tag, index) => (
                <Tag key={index} tag={tag} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

function Tag({ tag }) {
  const { t } = useTranslation();
  const title = typeof tag === 'object' ? tag.title : tag;
  const iconId = typeof tag === 'object' && tag.icon;
  const tooltip = typeof tag === 'object' && tag.tooltip;

  return (
    <div>
      {title}
      <div style={{ height: 16 }}>
        {iconId && <Icon iconId={iconId} iconWidth={16} iconHeight={16} iconClass={s.tagIcon} />}
        {tooltip && (
          <div
            className={clsx(tableStyle.actionDropdown, tableStyle.text, tableStyle.thDropdown)}
            style={{ left: -150 }}
          >
            {t(tooltip)}
          </div>
        )}
      </div>
    </div>
  );
}
