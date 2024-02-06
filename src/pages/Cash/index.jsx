import s from './index.module.scss';
import React, { createContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Box, Button, ErrorBoundaryHoc, Link } from '@components';
import { useOutsideClick } from '@hooks';
import { BalanceTable, ExchangeRatesDropdown, PartiallyPaidTable, Sidebar } from './components';

const TOP_TABS = [
  {
    title: 'mainInCash',
    path: 'main',
    tabs: [
      { title: 'noun', path: 'noun' },
      { title: 'cashRegister', path: 'cash_register' },
      { title: 'cashlessRegister', path: 'cashless_cash_register' },
    ],
  },
  {
    title: 'paymentInvoices',
    path: 'payment_bills',
    tabs: [
      { title: 'paymentPending', path: 'pending_payments' },
      { title: 'partiallyPaid', path: 'partially_paid' },
      { title: 'debt', path: 'debt' },
      { title: 'paid', path: 'paid' },
    ],
  },
  { title: 'brokerRequest', path: 'broker_request' },
  { title: 'moneyTransfers', path: 'money_transfers' },
  { title: 'moneyConversion', path: 'money_conversion' },
];

export const CashContext = createContext();

export const Cash = ErrorBoundaryHoc(() => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const ref = useRef();
  useOutsideClick(ref, () => setDropdownOpen(false));

  const bottomTabs = useMemo(() => {
    if (!searchParams.get('tab')) return [];
    return TOP_TABS.find(({ path }) => path === searchParams.get('tab')).tabs || [];
  }, [searchParams]);

  return (
    <CashContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className={s.root}>
        {!sidebarOpen && <Sidebar />}
        <Box className={s.box}>
          <div className={s.header}>
            <div>
              <div className={s.tabs}>
                {TOP_TABS.map(({ title, path, tabs }) => (
                  <Link
                    className={clsx(searchParams.get('tab') === path && s.active)}
                    key={path}
                    to={`?tab=${path}&inner_tab=${tabs?.[0].path || ''}`}
                  >
                    {t(title)}
                  </Link>
                ))}
              </div>
              <div className={clsx(s.tabs, s.bottom)}>
                {bottomTabs.map(({ title, path }) => (
                  <Link
                    className={clsx(searchParams.get('inner_tab') === path && s.active)}
                    key={path}
                    to={`?tab=${searchParams.get('tab')}&inner_tab=${path}`}
                  >
                    {t(title)}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className={s.ratesDropdownBtnWrap} ref={ref}>
                <Button
                  iconWidth={30}
                  iconHeight={21}
                  value={t('exchangeRates')}
                  isOrange
                  style={{ fontSize: 14, paddingInline: window.innerWidth <= 1440 ? 5 : 16 }}
                  iconLeftId="exchange"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  textStyle={{ whiteSpace: 'nowrap' }}
                />
                <ExchangeRatesDropdown isOpen={dropdownOpen} />
              </div>
            </div>
          </div>
          {searchParams.get('inner_tab') === 'partially_paid' && <PartiallyPaidTable />}
          {searchParams.get('inner_tab') === 'noun' && <BalanceTable />}
        </Box>
      </div>
    </CashContext.Provider>
  );
});
