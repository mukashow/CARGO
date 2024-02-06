import s from './index.module.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes as BrowserRoutes, Route, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Header, Icon, Link } from '@/components';
import { HANDBOOKS } from '@/constants';
import { AttachedDocTypes } from './AttachedDocTypes';
import { AttachedDocTypesByRole } from './AttachedDocTypesByRole';
import { ConsumptionType } from './ConsumptionType';
import { ContainerState } from './ContainerState';
import { Countries } from './Countries';
import { Currency } from './Currency';
import { CustomClearanceFees } from './CustomClearanceFees';
import { Directions } from './Directions';
import { DocumentProcessingFees } from './DocumentProcessingFees';
import { ExchangeRates } from './ExchangeRates';
import { GoodsTypes } from './GoodsTypes';
import { PhoneTypes } from './PhoneTypes';
import { Routes } from './Routes';
import { TransportationRates } from './TransportationRates';
import { Warehouses } from './Warehouses';
import { Waypoints } from './Waypoints';

export const Handbooks = ErrorBoundaryHoc(() => {
  const [isCreatingTariff, setIsCreatingTariff] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (pathname.split('/').pop() === 'handbooks') {
      navigate(HANDBOOKS[0].path, { replace: true });
    }
  }, [pathname]);

  const setFieldLabel = field => {
    let language;
    if (i18n.language.match(/ru|ru-RU/)) {
      language = 'inRussian';
    } else if (i18n.language.match(/en|en-US/)) {
      language = 'inEnglish';
    } else language = 'inChinese';
    return `${t(field).toLowerCase()} ${t(language)}:`;
  };

  const setHeadRow = useCallback(row => {
    return row.filter(lang => {
      if (i18n.language.match(/en|en-US/)) {
        return lang !== 'inEnglish';
      }
      if (i18n.language.match(/ru|ru-RU/)) {
        return lang !== 'inRussian';
      }
      return lang !== 'inChinese';
    });
  }, []);

  return (
    <>
      <Header mb={40} className={s.header}>
        <div className={s.headerTop}>
          <div className={s.currentTab}>
            {t(HANDBOOKS.find(({ path }) => pathname === '/handbooks/' + path)?.label)}
          </div>
          <div className={s.handbooksBtn}>
            {t('allHandbooks')} <Icon iconId="arrowRight" />
          </div>
        </div>
        <div className={s.handbooks}>
          {HANDBOOKS.map(({ label, path, params }) => (
            <Link
              key={path}
              className={clsx(pathname === '/handbooks/' + path && s.active)}
              to={`/handbooks/${path}?${new URLSearchParams(params).toString()}`}
            >
              <div>
                <Icon iconId="folder" color="white" iconClass={s.handbookIcon} />
                <span>{t(label)}</span>
                <Icon iconId="arrowRight" color="#0B6BE6" />
              </div>
            </Link>
          ))}
        </div>
      </Header>
      <BrowserRoutes>
        <Route
          path="warehouses"
          element={<Warehouses setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="countries"
          element={<Countries setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="goods_types"
          element={<GoodsTypes setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="waypoints_and_directions"
          element={<Waypoints setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route path="directions" element={<Directions />} />
        <Route
          path="phone_numbers_types"
          element={<PhoneTypes setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route path="routes" element={<Routes />} />
        <Route path="custom_clearance_fees" element={<CustomClearanceFees />} />
        <Route path="doc_processing_fees" element={<DocumentProcessingFees />} />
        <Route
          path="attached_docs_types"
          element={<AttachedDocTypes setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="attached_docs_types_by_role"
          element={<AttachedDocTypesByRole setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="currency"
          element={<Currency setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="consumption_type"
          element={<ConsumptionType setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="containers_states"
          element={<ContainerState setHeadRow={setHeadRow} setFieldLabel={setFieldLabel} />}
        />
        <Route
          path="transportation_tariffs"
          element={
            <TransportationRates
              isCreatingTariff={isCreatingTariff}
              setIsCreatingTariff={setIsCreatingTariff}
            />
          }
        />
        <Route path="exchange_rates" element={<ExchangeRates />} />
      </BrowserRoutes>
    </>
  );
});
