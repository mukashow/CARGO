import formCardStyle from '@components/Card/FormCard/index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import tabStyle from '@components/Tabs/index.module.scss';
import s from '@pages/ActAcceptanceCreate/index.module.scss';
import mainStyle from '@pages/PaymentInvoice/index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import { getClientInformation, uppercase } from '@/helpers';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { HEAD_ROW, Row } from '@pages/PaymentInvoice/Create';
import {
  Button,
  CardInformation,
  ErrorBoundaryHoc,
  FormCard,
  Modal,
  SelectCustom,
  Table,
} from '@components';
import { createInvoice, fetchClientGoodsAcceptance, loadClientsAsync } from '@actions';

export const ModalPaymentInvoiceCreate = ErrorBoundaryHoc(({ isOpen, close }) => {
  const [goods, setGoods] = useState(null);
  const [searchType, setSearchType] = useState('code');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInvoiceCreating, setIsInvoiceCreating] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const schema = yup.object({
    client: yup.object().required(t('fieldShouldBeFilled')),
  });
  const {
    control,
    formState: { errors },
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
      .then(close)
      .finally(() => setIsInvoiceCreating(false));
  };

  return (
    <Modal isOpen={isOpen} close={close} contentStyle={{ maxWidth: 1650, width: '100%' }}>
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
                maxHeight={window.innerHeight - 160}
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
      <div className={s.footer}>
        <Button
          value={t('modalCreateClientCreate')}
          disabled={loading || isInvoiceCreating}
          isBlue
          onClick={handleSubmit(onInvoiceCreate)}
        />
        <Button value={t('cancel')} onClick={() => navigate(-1)} />
      </div>
    </Modal>
  );
});
