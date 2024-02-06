import s from './index.module.scss';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { ErrorBoundary, ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Button, Checkbox, Icon, Link, Loader, Pagination } from '@/components';
import { useSearchParamsState } from '@/hooks';

export const Table = ErrorBoundaryHoc(
  ({
    filter,
    title,
    headerOptions,
    footerTags,
    headRow,
    row,
    RowComponent,
    currentPage,
    resultsCount,
    rowProps,
    emptyMessage,
    withBorder,
    maxHeight = window.innerHeight,
    height = 'auto',
    className,
    selectable,
    checked,
    onSelect = () => {},
    size = 'default',
    footerBtnValue = 'modalConfirmLabelConfirm',
    onFooterBtnClick,
    tableStyle,
    rootTableStyle,
    loading = false,
    children,
    theadTabs,
    theadTabKey,
    footerBtnDisabled,
    thead,
    onPaginate,
    onWrapRef,
    rootClass,
    hideNoMessage,
    footerShadow,
  }) => {
    const [tableMaxHeight, setMaxHeight] = useState(maxHeight);
    const { t } = useTranslation();
    const [searchParams] = useSearchParamsState();
    const { pathname } = useLocation();

    const setTabLink = useCallback(
      id => {
        const obj = {};
        for (const [key, value] of searchParams.entries()) {
          obj[key] = value;
        }
        obj[theadTabKey] = id.toString();
        let params = '';
        for (const key in obj) {
          params = `${params}${key}=${obj[key]}&`;
        }
        if (params.at(-1)) {
          params = params.slice(0, -1);
        }
        return `${pathname}?${params}`;
      },
      [pathname, searchParams]
    );

    const onRef = ref => {
      if (ref) {
        const tableWrap = ref.querySelector(`.${s.tableWrap}`);
        if (
          tableWrap.querySelector(`.${s.tableWrap} > table`).clientWidth > tableWrap.clientWidth
        ) {
          tableWrap.style.paddingBottom = '16px';
        }

        if (size === 'small') return setMaxHeight('none');

        const box = ref.closest('.boxRoot');
        if (box) {
          box.closest('main').style.paddingBottom = 0;
          return setMaxHeight(window.innerHeight - box.offsetTop - 3);
        }
        setMaxHeight(maxHeight);
      }
    };

    return (
      <div
        className={clsx(s.root, rootClass)}
        style={{
          maxHeight: tableMaxHeight,
          height,
          ...(withBorder && { flexGrow: 0 }),
          ...(!!filter && { minHeight: 435 }),
          ...rootTableStyle,
        }}
        ref={onRef}
      >
        {filter && (
          <div className={s.header}>
            {title && (
              <div className={s.headerLeft}>
                <h2 className={s.title}>{title}</h2>
                <div className={s.headerLeftOptions}>
                  {headerOptions.map(option => (
                    <span key={option}>{option}</span>
                  ))}
                </div>
              </div>
            )}
            <div className={s.headerRight}>{filter}</div>
          </div>
        )}
        <div
          className={clsx(s.tableWrap, withBorder && s.border, s[size], className)}
          ref={onWrapRef}
        >
          {thead}
          <table style={tableStyle}>
            {theadTabs && (
              <thead className={s.theadTab}>
                <tr>
                  <th>
                    <div>
                      {theadTabs.map(({ id, name }) => (
                        <Link
                          to={setTabLink(id)}
                          key={id}
                          data-active={searchParams.get(theadTabKey) === String(id)}
                        >
                          {name}
                        </Link>
                      ))}
                    </div>
                  </th>
                </tr>
              </thead>
            )}
            {headRow && (
              <thead>
                <tr>
                  {selectable && (
                    <th style={{ minWidth: 24 }}>
                      <Checkbox size="big" checked={checked} onChange={onSelect} />
                    </th>
                  )}
                  {headRow.map((th, index) => (
                    <Th thead={th} index={index} key={index} />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {!loading &&
                row?.map((item, index) => (
                  <ErrorBoundary key={item.id || index}>
                    <RowComponent item={item} index={index} {...rowProps} />
                  </ErrorBoundary>
                ))}
            </tbody>
          </table>
          {loading && <Loader size={size} />}
          {!loading && row?.length === 0 && !hideNoMessage && (
            <div className={clsx(s.empty, size === 'small' && s.emptySmall)}>
              <img src="/images/Empty-Box.svg" alt="" />
              <div className={s.emptyTitle}>{t(emptyMessage)}</div>
            </div>
          )}
        </div>
        {children || null}
        {!loading &&
          !!row?.length &&
          (!!onFooterBtnClick || resultsCount || currentPage || footerTags) && (
            <div className={clsx(s.navigation, footerShadow && s.shadow)}>
              {onFooterBtnClick && (
                <Button
                  disabled={footerBtnDisabled}
                  value={t(footerBtnValue)}
                  className={s.footerButton}
                  isBlue
                  onClick={onFooterBtnClick}
                />
              )}
              {resultsCount && currentPage && (
                <Pagination
                  current_page={currentPage}
                  results_count={resultsCount}
                  onChange={onPaginate}
                />
              )}
              {footerTags && (
                <div className={s.navigationRight}>
                  <div className={s.footerTags}>
                    <div className={s.navigationText}>{t('tableClientTotal')}:</div>
                    {footerTags.map(tag => (
                      <div key={tag} className={s.navigationText}>
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    );
  }
);

function Th({ thead }) {
  const { t } = useTranslation();
  const th = typeof thead === 'object' ? thead.title : thead;
  const iconId = typeof thead === 'object' && thead.icon;
  const tooltip = typeof thead === 'object' && thead.tooltip;

  return (
    <th
      {...(th.match(/tableDocAction|tableClientAction/) && {
        style: { minWidth: 'auto', width: 95, textAlign: 'right' },
      })}
    >
      <div className={s.textFlex}>
        {t(th).replace(/[:。]/g, '')}
        <div>
          {iconId && (
            <Icon
              iconId={iconId}
              iconHeight={16}
              iconWidth={16}
              style={{ marginLeft: 4 }}
              onClick={() => thead.onIconClick?.()}
              color="#9795A4"
              clickable={!!thead.onIconClick}
              iconClass={s.thIcon}
            />
          )}
          {tooltip && (
            <div className={clsx(s.actionDropdown, s.text, s.thDropdown)}>{t(tooltip)}</div>
          )}
        </div>
      </div>
    </th>
  );
}
