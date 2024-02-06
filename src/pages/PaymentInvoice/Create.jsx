import mainStyle from './index.module.scss';
import formCardStyle from '@components/Card/FormCard/index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import tabStyle from '@components/Tabs/index.module.scss';
import s from '@pages/ActAcceptanceCreate/index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import { getClientInformation, uppercase } from '@/helpers';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  CardInformation,
  ErrorBoundaryHoc,
  FormCard,
  Header,
  ModalAction,
  SelectCustom,
  Table,
  TableChain,
} from '@components';
import { createInvoice, fetchClientGoodsAcceptance, loadClientsAsync } from '@actions';
import { useConfirmNavigate } from '@hooks';

export const HEAD_ROW = [
  'admissionDate',
  'actNumber',
  'seatsNumber',
  'weight',
  'volume',
  'directionFilter',
  'sum',
];

export const PaymentInvoiceCreate = ErrorBoundaryHoc(() => {
  const [goods, setGoods] = useState(null);
  const [searchType, setSearchType] = useState('code');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInvoiceCreating, setIsInvoiceCreating] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [backModalOpen, backConfirmResolve, cancelBack] = useConfirmNavigate();

  const schema = yup.object({
    client: yup.object().required(t('fieldShouldBeFilled')),
  });
  const {
    control,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm({ resolver: yupResolver(schema) });

  const onClientSelect = async ({ value }) => {
    setLoading(true);
    dispatch(fetchClientGoodsAcceptance(value))
      .unwrap()
      .then(setGoods)
      .finally(() => setLoading(false));
    const { data } = await api(`client/${value}/`);
    setClient(data);
  };

  const onInvoiceCreate = ({ client }) => {
    setIsInvoiceCreating(true);
    dispatch(createInvoice(client.value))
      .unwrap()
      .then(({ id }) => navigate(`/payment_invoice/${id}/`))
      .catch(errors => {
        for (const key in errors) {
          setError(key, { message: errors[key] });
        }
      })
      .finally(() => setIsInvoiceCreating(false));
  };

  return (
    <>
      <Header title={t('paymentInvoice')} />
      <Box style={{ padding: '40px 30px' }}>
        <div className={mainStyle.box}>
          <FormCard
            topTitle={t('addingClientData')}
            cardTitle={t('clientData')}
            className={s.card}
            cardStyle={{ borderColor: '#F4F7FB' }}
          >
            <div className={s.selectWrap}>
              <SelectCustom
                control={control}
                name="client"
                async
                loadOptions={value => loadClientsAsync(value, searchType === 'phone')}
                labelText={`${t(searchType === 'code' ? 'clientCodeClient' : 'clientNumber')}:`}
                placeholder={t('selectReceiver')}
                error={errors.client?.message}
                onChange={onClientSelect}
              />
              <div className={s.selectType}>
                <p data-active={searchType === 'code'} onClick={() => setSearchType('code')}>
                  {uppercase(t('clientCodeClient'))}
                </p>
                <p data-active={searchType === 'phone'} onClick={() => setSearchType('phone')}>
                  {t('phoneNumber')}
                </p>
              </div>
            </div>
            <CardInformation
              className={s.information}
              information={
                client
                  ? getClientInformation(client, t, [
                      { title: t('clientFullName'), value: '' },
                      { title: t('clientPhone'), value: '' },
                      { title: t('clientAddress'), value: '' },
                      { title: t('clientCompany'), value: '' },
                    ])
                  : []
              }
            />
          </FormCard>
          <div className={mainStyle.goodsTableWrap}>
            <div className={formCardStyle.rootTop}>
              <span>{t('clientGoodsAcceptance')}</span>
            </div>
            {!goods ? null : !!goods.goods_acceptance_list.length ? (
              <>
                <div className={tabStyle.tags} style={{ marginTop: 16, marginBottom: 40 }}>
                  <div style={{ background: '#F6F6F6' }}>
                    {goods.total.place_count} {t('seats')}
                  </div>
                  <div style={{ background: '#F6F6F6' }}>
                    {goods.total.weight} {t('weightKg')}
                  </div>
                  <div style={{ background: '#F6F6F6' }}>
                    {goods.total.volume} {t('cubicMeter')}
                  </div>
                  <div style={{ background: '#F6F6F6' }}>
                    {goods.total.cost} {goods.total.currency.symbol}
                  </div>
                </div>
                <Table
                  headRow={HEAD_ROW}
                  withBorder
                  className={mainStyle.table}
                  rootClass={mainStyle.tableRoot}
                  RowComponent={Row}
                  row={goods.goods_acceptance_list}
                  hideNoMessage
                  loading={loading}
                />
              </>
            ) : (
              <>
                <div className={tableStyle.empty}>
                  <img src="/images/Empty-Box.svg" alt="" />
                  <div className={tableStyle.emptyTitle}>{t('noGoodsAcceptance')}</div>
                  <div className={tableStyle.emptyTitle} style={{ marginTop: 6 }}>
                    {t('cannotCreateInvoice')}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Box>
      <div className={s.footer}>
        <Button
          value={t('modalCreateClientCreate')}
          disabled={loading || isInvoiceCreating}
          isBlue
          onClick={handleSubmit(onInvoiceCreate)}
        />
        <Button value={t('cancel')} onClick={() => navigate(-1)} />
      </div>
      <ModalAction
        isOpen={backModalOpen}
        title={t('toCancelInvoiceCreation')}
        description={t('invoiceDataWontBeSaved')}
        onSubmit={backConfirmResolve}
        onCancel={cancelBack}
      />
    </>
  );
});

export const Row = ErrorBoundaryHoc(function Row({
  item: { acceptance_date, id, place_count, weight, volume, direction, cost, currency },
}) {
  const { t } = useTranslation();

  return (
    <tr>
      <td className={tableStyle.text}>{acceptance_date?.slice(0, 10)}</td>
      <td className={tableStyle.text}>#{id}</td>
      <td className={tableStyle.text}>
        {place_count} {t('seats')}
      </td>
      <td className={tableStyle.text}>
        {weight} {t('weightKg')}
      </td>
      <td className={tableStyle.text}>
        {volume} {t('cubicMeter')}
      </td>
      <td>
        <TableChain
          chain={
            direction.custom_clearance_country_name
              ? [
                  { title: direction.point_from_name },
                  { title: direction.custom_clearance_country_name },
                  { title: direction.point_to_name },
                ]
              : [{ title: direction.point_from_name }, { title: direction.point_to_name }]
          }
        />
      </td>
      <td className={tableStyle.text}>
        {cost} {currency.symbol}
      </td>
    </tr>
  );
});
