import settingsStyle from '../Settings/index.module.scss';
import s from './index.module.scss';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectNavigationByRole } from '@selectors/auth';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon, Link } from '@/components';

export const Navigation = ErrorBoundaryHoc(() => {
  const navigation = useSelector(selectNavigationByRole);
  const role = useSelector(state => state.auth.user.role_id);
  const hasCashierPermissions = useSelector(state => state.auth.user.has_cashier_permissions);
  const [creationListVisible, setCreationListVisible] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const finalNavigation = useMemo(() => {
    // if (role !== 1) return navigation;
    // return navigation.map(item => {
    //   if (item.path !== '/cash') return item;
    //   return {
    //     ...item,
    //     renderingCondition: !!hasCashierPermissions,
    //   };
    // });
    return navigation;
  }, [hasCashierPermissions]);

  return (
    <div>
      <div className={s.logo}>
        <svg id="logo" viewBox="0 0 90 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.5114 49.9998H9.62346L22.3878 9.99995H0L2.74348 2.09068C3.1776 0.839151 4.35688 0 5.68156 0H27.5219H27.5282H29.5687H36.4161H58.5348L55.2347 8.06755C54.7566 9.23633 53.6192 9.99995 52.3564 9.99995H33.2158L20.9693 48.2666C20.6351 49.3145 19.6418 50.001 18.5114 49.9998ZM67.306 13.4373H74.2102C75.5465 13.4373 76.7335 14.291 77.1585 15.558L82.4776 31.4138L88.0305 33.6008C89.5748 34.209 90.3693 35.9228 89.8355 37.4944L85.5881 49.9996H56.589L67.306 13.4373ZM37.8609 13.4373H64.4694L61.3223 23.4372H32.0031L34.9434 15.4703C35.3943 14.2486 36.5586 13.4373 37.8609 13.4373ZM60.3705 26.5615H33.4821C32.1701 26.5615 30.9992 27.3849 30.5555 28.6196L27.5891 36.874H57.2184L60.3705 26.5615ZM29.3071 39.9997H56.2725L53.4356 49.9996H23.4909L26.3848 42.0462C26.8318 40.8175 27.9997 39.9997 29.3071 39.9997Z"
            fill="url(#paint0_linear_0_3)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_0_3"
              x1="44.904"
              y1="1.8851e-06"
              x2="44.904"
              y2="49.9998"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#346E60" />
              <stop offset="1" stopColor="#F27C4A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className={s.root}>
        {finalNavigation?.map(
          ({ title, path, params = '', iconId, renderingCondition, dropdown }) => {
            if (renderingCondition !== undefined && !renderingCondition) return null;

            const isActive =
              pathname === path || (path === '/warehouse' && pathname.includes('/warehouse/'));
            return (
              <div key={iconId}>
                <Link className={clsx(s.item, isActive && s.active)} to={path + params}>
                  <Icon iconId={iconId} iconWidth={24} iconHeight={24} />
                  {t(title)}
                </Link>
                {dropdown && isActive && (
                  <div className={settingsStyle.blockWrap}>
                    <div className={clsx(settingsStyle.block, settingsStyle.blockInLink)}>
                      <div
                        className={clsx(
                          settingsStyle.create,
                          creationListVisible && settingsStyle.opened
                        )}
                        style={{ height: 48, background: 'white' }}
                        onClick={() => setCreationListVisible(!creationListVisible)}
                      >
                        <Icon iconId="plusCircle" style={{ marginRight: 6 }} color="#EE8234" />
                        <p style={{ fontSize: 14 }}>{t(dropdown.title)}</p>
                        <Icon iconId="arrowRight" iconClass={settingsStyle.arrow} color="#232323" />
                      </div>
                      <div
                        className={settingsStyle.creationList}
                        style={{ display: creationListVisible ? 'grid' : 'none' }}
                      >
                        {dropdown.list.map(({ title, path }) => (
                          <Link key={path} to={path} className={settingsStyle.static}>
                            {t(title)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
});
