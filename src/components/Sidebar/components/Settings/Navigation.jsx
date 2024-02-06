import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  Link,
  ModalCreateClient,
  ModalCreateUpdateContainer,
  ModalCreateEmployee,
} from '@/components';

export const ChiefManager = () => {
  const [createClientModal, setCreateClientModal] = useState(false);
  const [createEmployeeModal, setCreateEmployeeModal] = useState(false);
  const [createContainerModal, setCreateContainerModal] = useState(false);
  const { t } = useTranslation();
  const { pathname, search } = useLocation();

  return (
    <>
      <Link to="/loading_list/create" state={{ path: pathname + search }}>
        {t('loadingList')}
      </Link>
      <span onClick={() => setCreateClientModal(true)}>{t('createButtonClient')}</span>
      <span onClick={() => setCreateEmployeeModal(true)}>{t('theEmployee')}</span>
      <span onClick={() => setCreateContainerModal(true)}>{t('container')}</span>
      <ModalCreateClient isOpen={createClientModal} close={() => setCreateClientModal(false)} />
      <ModalCreateEmployee
        isOpen={createEmployeeModal}
        close={() => setCreateEmployeeModal(false)}
      />
      <ModalCreateUpdateContainer
        isOpen={createContainerModal}
        close={() => setCreateContainerModal(false)}
      />
    </>
  );
};

export const Manager = () => {
  const [createContainerModal, setCreateContainerModal] = useState(false);
  const { t } = useTranslation();
  const { pathname, search } = useLocation();

  return (
    <>
      <Link to="/goods_act_acceptance/create" state={{ path: pathname + search }}>
        {t('acceptanceReport')}
      </Link>
      <Link to="/loading_list/create" state={{ path: pathname + search }}>
        {t('loadingList')}
      </Link>
      <span onClick={() => setCreateContainerModal(true)}>{t('container')}</span>
      <ModalCreateUpdateContainer
        isOpen={createContainerModal}
        close={() => setCreateContainerModal(false)}
      />
    </>
  );
};

export const Storekeeper = () => {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();

  return (
    <>
      <Link to="/goods_act_acceptance/create" state={{ path: pathname + search }}>
        {t('acceptanceReport')}
      </Link>
    </>
  );
};
