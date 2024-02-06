import s from '../../ActAcceptanceCreate/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getClientInformation } from '@/helpers';
import {
  fetchClient,
  fetchClientInfoByCode,
  fetchGoodsAcceptanceUpdateFields,
  loadClientsAsync,
} from '@/store/actions';
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
    const [updateFieldId, setUpdateFieldId] = useState(0);
    const [activeClientForm, setActiveClientForm] = useState('receiver');
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { actId } = useParams();

    const onCreateClient = id => {
      dispatch(fetchClient(id))
        .unwrap()
        .then(data => {
          dispatch(fetchClientInfoByCode({ type: activeClientForm, code: data.code }));
          setValue(activeClientForm, { label: data.code, value: data.id });
        });
    };

    const setDisabled = ids => !ids.includes(updateFieldId);

    useEffect(() => {
      dispatch(fetchGoodsAcceptanceUpdateFields(actId))
        .unwrap()
        .then(({ id }) => setUpdateFieldId(id));
    }, []);

    return (
      <form className={clsx(s.form, s.manager)}>
        <FormCard
          topTitle={t('addingReceiver')}
          index={0}
          cardTitle={t('receiver')}
          className={s.card}
          disabled={setDisabled([1])}
        >
          <SelectCustom
            control={control}
            name="receiver"
            async
            cacheOptions
            loadOptions={loadClientsAsync}
            labelText={t('receiverCode')}
            placeholder={t('selectReceiver')}
            error={errors.receiver?.message}
            noOptionsMessage={({ inputValue }) =>
              t(inputValue ? 'receiverCodeNotFound' : 'noOptions')
            }
          />
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
          disabled={setDisabled([1, 2])}
          topTitle={t('addingSender')}
          index={1}
          cardTitle={t('sender')}
          className={s.card}
        >
          <SelectCustom
            control={control}
            name="sender"
            async
            cacheOptions
            loadOptions={loadClientsAsync}
            labelText={t('senderCode')}
            placeholder={t('selectSender')}
            error={!!receiver && errors.sender?.message}
            noOptionsMessage={({ inputValue }) =>
              t(inputValue ? 'receiverCodeNotFound' : 'noOptions')
            }
          />
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
          topTitle={t('addingGeneralData')}
          index={2}
          cardTitle={t('generalData')}
          className={s.card}
        >
          <div className={s.selectsWrap}>
            <SelectCustom
              control={control}
              name="transportation_type"
              isDisabled={setDisabled([1])}
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
              isDisabled={setDisabled([1, 2])}
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
