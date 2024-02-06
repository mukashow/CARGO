import s from '../index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Box, ErrorBoundaryHoc, Header } from '@components';
import { Cards, Receipt, Tabs } from './components';

export const PaymentInvoiceDetail = ErrorBoundaryHoc(() => {
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <>
      <Header title={`${t('paymentInvoice')} #${id}`} />
      <Box className={s.detailPageBox}>
        <Cards />
        <Tabs />
        <Receipt />
      </Box>
    </>
  );
});
