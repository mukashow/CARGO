import s from '../../index.module.scss';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getClientInformation, uppercase } from '@/helpers';
import { fetchClient, fetchClientInfoByCode, loadClientsAsync } from '@/store/actions';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  Button,
  CardInformation,
  FormCard,
  Input,
  ModalCreateClient,
  SelectCustom,
} from '@/components';

export const Form = ErrorBoundaryHoc(
  ({ control, receiver, errors, payers, register, setValue }) => {
    const { transportationType, clientDirectionList, clientContractType, clientInfo } = useSelector(
      state => ({
        transportationType: state.transportation.transportationType,
        clientDirectionList: state.warehouse.clientDirectionList,
        clientContractType: state.clients.clientContractType,
        clientInfo: state.clients.clientInfo,
      })
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeClientForm, setActiveClientForm] = useState('receiver');
    const [clientSearchType, setClientSearchType] = useState({
      receiver: 'code',
      sender: 'code',
    });
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const onCreateClient = id => {
      dispatch(fetchClient(id))
        .unwrap()
        .then(data => {
          dispatch(fetchClientInfoByCode({ type: activeClientForm, code: data.code }));
          setValue(activeClientForm, { label: data.code, value: data.id });
        });
    };

    return (
      <form className={clsx(s.form, s.manager)}>
        <FormCard
          topTitle={t('addingReceiver')}
          index={0}
          cardTitle={t('receiver')}
          className={s.card}
        >
          <div className={s.selectWrap}>
            <SelectCustom
              control={control}
              name="receiver"
              async
              loadOptions={value => loadClientsAsync(value, clientSearchType.receiver === 'phone')}
              labelText={t(clientSearchType.receiver === 'code' ? 'receiverCode' : 'receiverPhone')}
              placeholder={t('selectReceiver')}
              error={errors.receiver?.message}
              noOptionsMessage={({ inputValue }) =>
                t(
                  inputValue
                    ? clientSearchType.receiver === 'phone'
                      ? 'receiverNumberNotFound'
                      : 'receiverCodeNotFound'
                    : 'noOptions'
                )
              }
            />
            <div className={s.selectType}>
              <p
                data-active={clientSearchType.receiver === 'code'}
                onClick={() => setClientSearchType({ ...clientSearchType, receiver: 'code' })}
              >
                {uppercase(t('clientCodeClient'))}
              </p>
              <p
                data-active={clientSearchType.receiver === 'phone'}
                onClick={() => setClientSearchType({ ...clientSearchType, receiver: 'phone' })}
              >
                {t('phoneNumber')}
              </p>
            </div>
          </div>
          <CardInformation
            className={s.information}
            information={getClientInformation(clientInfo.receiver, t)}
          />
          <Button
            value={t('createNew')}
            isSmall
            iconLeftId="blue-plus"
            lightBlue
            style={{ marginTop: 'auto' }}
            onClick={() => {
              setIsModalOpen(true);
              setActiveClientForm('receiver');
            }}
          />
        </FormCard>
        <FormCard
          disabled={!receiver}
          topTitle={t('addingSender')}
          index={1}
          cardTitle={t('sender')}
          className={s.card}
        >
          <div className={s.selectWrap}>
            <SelectCustom
              control={control}
              name="sender"
              async
              loadOptions={value => loadClientsAsync(value, clientSearchType.sender === 'phone')}
              labelText={t(clientSearchType.sender === 'code' ? 'senderCode' : 'senderPhone')}
              placeholder={t('selectSender')}
              error={!!receiver && errors.sender?.message}
              noOptionsMessage={({ inputValue }) =>
                t(
                  inputValue
                    ? clientSearchType.sender === 'phone'
                      ? 'senderNumberNotFound'
                      : 'senderCodeNotFound'
                    : 'noOptions'
                )
              }
            />
            <div className={s.selectType}>
              <p
                data-active={clientSearchType.sender === 'code'}
                onClick={() => setClientSearchType({ ...clientSearchType, sender: 'code' })}
              >
                {uppercase(t('clientCodeClient'))}
              </p>
              <p
                data-active={clientSearchType.sender === 'phone'}
                onClick={() => setClientSearchType({ ...clientSearchType, sender: 'phone' })}
              >
                {t('phoneNumber')}
              </p>
            </div>
          </div>
          <CardInformation
            className={s.information}
            information={getClientInformation(clientInfo.sender, t)}
          />
          <Button
            value={t('createNew')}
            isSmall
            iconLeftId="blue-plus"
            lightBlue
            style={{ marginTop: 'auto' }}
            onClick={() => {
              setIsModalOpen(true);
              setActiveClientForm('sender');
            }}
          />
        </FormCard>
        <FormCard
          disabled={!receiver}
          topTitle={t('addingGeneralData')}
          index={2}
          cardTitle={t('generalData')}
          className={s.card}
        >
          <div className={s.selectsWrap}>
            <SelectCustom
              control={control}
              name="transportation_type"
              options={transportationType}
              labelText={t('transportationType')}
              placeholder={t('modalCreateClientPlaceholder')}
              error={!!receiver && errors.transportation_type?.message}
            />
            <SelectCustom
              control={control}
              name="payer"
              options={payers}
              labelText={t('payerParty')}
              placeholder={t('modalCreateClientPlaceholder')}
              error={!!receiver && errors.payer?.message}
            />
            <SelectCustom
              control={control}
              name="contract_type"
              options={clientContractType}
              labelText={t('contractType')}
              placeholder={t('modalCreateClientPlaceholder')}
              error={!!receiver && errors.contract_type?.message}
            />
            <SelectCustom
              control={control}
              name="direction"
              options={clientDirectionList}
              labelText={t('direction')}
              placeholder={t('modalCreateClientPlaceholder')}
              error={!!receiver && errors.direction?.message}
            />
            <Input
              register={register}
              name="insurance_sum"
              labelText={t('insurance')}
              placeholder={t('enterValueOptional')}
              errors={!!receiver && errors.insurance_sum?.message}
            />
          </div>
        </FormCard>
        <ModalCreateClient
          isOpen={isModalOpen}
          close={() => setIsModalOpen(false)}
          callback={onCreateClient}
        />
      </form>
    );
  }
);
