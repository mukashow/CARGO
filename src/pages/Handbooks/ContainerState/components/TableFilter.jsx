import React, { useMemo, useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Icon, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditContainerState } from './ModalCreateEditContainerState';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel }) => {
  const containers = useSelector(state => state.container.allContainersState);
  const [modalCreateContainerState, setModalCreateContainerState] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const phoneTypes = useMemo(() => {
    if (containers) {
      const type = containers.find(({ name }) => searchParams.get('name') === name);
      return type ? { name: type.name, id: type.id } : null;
    }
  }, [containers, searchParams]);

  return (
    <div className={s.filterRoot}>
      <Button
        value={t('add')}
        isSmall
        iconColor="#0B6BE6"
        black
        iconLeftId="blue-plus"
        lightBlue
        onClick={() => setModalCreateContainerState(true)}
      />
      <div className={s.filter}>
        <SelectCustom
          style={{ maxWidth: 250 }}
          labelText={t('stateName')}
          floatLabel
          placeholder={null}
          value={phoneTypes}
          thin
          options={containers}
          getOptionValue={option => option.id}
          getOptionLabel={option => option.name}
          onChange={({ name }) => setSearchParams({ name, page: 1 })}
        />
        <Icon
          iconId="cleaner"
          color="#DF3B57"
          clickable
          onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
        />
      </div>
      <ModalCreateEditContainerState
        setFieldLabel={setFieldLabel}
        isOpen={modalCreateContainerState}
        close={() => setModalCreateContainerState(false)}
      />
    </div>
  );
});
