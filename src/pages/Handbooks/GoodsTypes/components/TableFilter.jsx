import React, { useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { Button, Debounce, Icon } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditGoodsType } from './ModalCreateEditGoodsType';
import { useSearchParamsState } from '@/hooks';

export const TableFilter = ErrorBoundaryHoc(({ setFieldLabel, expandedCargo }) => {
  const [createGoodsTypeModal, setCreateGoodsTypeModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  return (
    <>
      <div className={s.filterRoot}>
        <Button
          value={t('add')}
          isSmall
          iconColor="#0B6BE6"
          black
          iconLeftId="blue-plus"
          lightBlue
          onClick={() => setCreateGoodsTypeModal(true)}
        />
        <div className={s.filter}>
          <Debounce
            value={searchParams.get('name') || ''}
            onChange={e => setSearchParams({ name: e.target.value, page: 1 })}
            thin
            labelText={t('goodsTypeName')}
            floatLabel
          />
          <div style={{ maxWidth: 100 }}>
            <Debounce
              value={searchParams.get('symbol') || ''}
              onChange={e => setSearchParams({ symbol: e.target.value, page: 1 })}
              thin
              labelText={t('codeLetter')}
              floatLabel
            />
          </div>
          <Icon
            iconId="cleaner"
            color="#DF3B57"
            clickable
            onClick={() => setSearchParams({ page: 1, page_size: 25 }, true)}
          />
        </div>
      </div>
      <ModalCreateEditGoodsType
        expandedCargo={expandedCargo}
        setFieldLabel={setFieldLabel}
        isOpen={createGoodsTypeModal}
        close={() => setCreateGoodsTypeModal(false)}
      />
    </>
  );
});
