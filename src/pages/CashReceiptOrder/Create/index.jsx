import s from '../index.module.scss';
import actStyle from '@pages/ActAcceptanceCreate/index.module.scss';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { declOfNum } from '@/helpers';
import { Box, Button, ErrorBoundaryHoc, Header, Table } from '@components';
import { TableFilter, TableRow } from './components';

const synopsis = ['счет', 'счета', 'счетов'];

const BUTTONS = [
  { title: 'invoicePayment', key: 'paying_bill', params: { page: 1, page_size: 25 } },
];

const TABLE_HEAD = [
  '',
  'tableDocDate',
  'invoiceNumber',
  'clientCodeClient',
  'goodsAcceptanceActs',
  'seatsNumber',
  'weight',
  'volume',
  'sum',
  'paid',
  'residue',
];

export const CashReceiptOrderCreate = ErrorBoundaryHoc(() => {
  const { t, i18n } = useTranslation();
  const [tableMaxHeight, setTableMaxHeight] = useState('none');
  const [searchParams, setSearchParams] = useSearchParams();
  const tableRef = useRef();
  const footerRef = useRef();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!tableRef.current || !footerRef.current) return;
    setTableMaxHeight(
      window.innerHeight - footerRef.current.clientHeight - tableRef.current.offsetTop
    );
  }, [searchParams]);

  return (
    <>
      <Header title={t('cashReceiptOrder')} />
      <div className={s.mainGrid}>
        <Box className={s.creationSidebar}>
          <Button isStaticTitle value={t('cashReceiptOrder')} style={{ marginBottom: 40 }} />
          <div className={s.buttons}>
            {BUTTONS.map(({ title, key, params }) => (
              <Button
                key={key}
                value={t(title)}
                lightBlue={searchParams.get('tab') !== key}
                isBlue={searchParams.get('tab') === key}
                isSmall
                style={{ fontWeight: searchParams.get('tab') === key ? 400 : 500 }}
                onClick={() => setSearchParams({ tab: key, ...params }, { replace: true })}
              />
            ))}
          </div>
        </Box>
        {searchParams.get('tab') && (
          <Box style={{ paddingTop: 10, overflow: 'auto', width: '100%' }}>
            <Table
              row={[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}
              className={s.creationTable}
              headRow={TABLE_HEAD}
              RowComponent={TableRow}
              filter={<TableFilter />}
              footerTags={[
                `10 ${
                  i18n.language.match(/ru|ru-RU/) ? declOfNum(10, synopsis) : t('bills').toLowerCase
                }`,
                '14 $',
              ]}
              onWrapRef={tableRef}
              height={tableMaxHeight}
            />
          </Box>
        )}
      </div>
      <div className={actStyle.footer} ref={footerRef}>
        <Button
          value={t('modalCreateClientCreate')}
          isBlue
          onClick={() => navigate('/cash_receipt_order/1')}
        />
        <Button value={t('cancel')} onClick={() => navigate(-1)} />
      </div>
    </>
  );
});
