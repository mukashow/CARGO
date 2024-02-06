import s from '../../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import { fetchAllDocTypesByRole, fetchAllRoles } from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Button, Icon, SelectCustom } from '@/components';
import { useSearchParamsState } from '@/hooks';
import { ModalCreateEditDocType } from './ModalCreateEditDocType';

export const TableFilter = ErrorBoundaryHoc(() => {
  const docTypes = useSelector(state => state.documents.allDocTypesByRole);
  const roles = useSelector(state => state.users.allRoles);
  const [modalCreateDocType, setModalCreateDocType] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllDocTypesByRole());
    dispatch(fetchAllRoles());
  }, []);

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreateDocType(true)}
      />
      <div className={s.filter}>
        <SelectCustom
          style={{ maxWidth: 200 }}
          labelText={uppercase(t('tableDocType'))}
          floatLabel
          placeholder={null}
          value={docTypes?.find(({ name }) => name === searchParams.get('name')) || null}
          thin
          getOptionValue={option => option.id}
          getOptionLabel={option => option.name}
          options={docTypes}
          onChange={({ name }) => setSearchParams({ name })}
        />
        <SelectCustom
          style={{ maxWidth: 150 }}
          labelText={t('userRole')}
          floatLabel
          placeholder={null}
          value={roles?.find(({ id }) => id === +searchParams.get('role')) || null}
          thin
          getOptionValue={option => option.id}
          getOptionLabel={option => option.name}
          options={roles}
          onChange={({ id }) => setSearchParams({ role: id })}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditDocType
        isOpen={modalCreateDocType}
        close={() => setModalCreateDocType(false)}
      />
    </div>
  );
});
