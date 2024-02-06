import s from './index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchWarehouseList } from '@/store/actions';
import { signOut } from '@slices/auth';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon, Link, ModalAction } from '@/components';
import { HANDBOOKS } from '@/constants';
import { ChiefManager, Manager, Storekeeper } from './Navigation';

export const Settings = ErrorBoundaryHoc(() => {
  const roleId = useSelector(state => state.auth.user?.role_id);
  const [creationListVisible, setCreationListVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [confirmExitModal, setConfirmExitModal] = useState(false);
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const navigation = useMemo(() => {
    if (!roleId) return;
    if (Number(roleId) === 1) return <Manager />;
    if (Number(roleId) === 2) return <Storekeeper />;
    if (Number(roleId) === 5) return <ChiefManager />;
  }, [roleId]);

  useEffect(() => {
    if (roleId === 5) dispatch(fetchWarehouseList());
  }, [roleId]);

  return (
    <div>
      {roleId !== 4 && roleId !== 3 && (
        <div className={s.block}>
          <div
            className={clsx(s.create, creationListVisible && s.opened)}
            onClick={() => setCreationListVisible(!creationListVisible)}
          >
            <Icon iconId="plusCircle" iconClass={s.createIcon} />
            <p>{t('sidebarCreate')}</p>
            <Icon iconId="arrowRight" iconClass={s.arrow} color="#232323" />
          </div>
          <div
            className={s.creationList}
            style={{ display: creationListVisible ? 'grid' : 'none' }}
          >
            {navigation}
          </div>
        </div>
      )}
      <div
        className={s.footer}
        style={{ paddingTop: roleId === 4 ? 0 : window.innerWidth > 1440 ? 30 : 10 }}
      >
        <Link className={s.item}>
          <Icon iconId="setting" iconWidth={24} iconHeight={24} color="#EE8234" />
          {t('settings')}
        </Link>
        {roleId === 5 && (
          <div>
            <div
              className={clsx(s.item, isDropdownOpen && s.opened)}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Icon iconId="book" iconWidth={24} iconHeight={24} color="#EE8234" />
              {t('handbooks')}
              <Icon iconId="arrowRight" iconClass={s.itemIcon} />
            </div>
            {isDropdownOpen && (
              <div className={s.dropdown}>
                <div>
                  {HANDBOOKS.map(({ label, path, params }) => (
                    <div key={path}>
                      <Link
                        to={`/handbooks/${path}?${new URLSearchParams(params).toString()}`}
                        className={clsx(
                          s.dropdownLink,
                          pathname === '/handbooks/' + path && s.active
                        )}
                      >
                        {t(label)}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className={s.item} onClick={() => setConfirmExitModal(true)}>
          <Icon iconId="exit" iconWidth={24} iconHeight={24} color="#EE8234" />
          {t('logOut')}
        </div>
      </div>
      <ModalAction
        title={t('exitConfirm')}
        isOpen={confirmExitModal}
        onCancel={() => setConfirmExitModal(false)}
        onSubmit={() => dispatch(signOut())}
      />
    </div>
  );
});
