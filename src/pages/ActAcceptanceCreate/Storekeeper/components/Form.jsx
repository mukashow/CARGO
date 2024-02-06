import s from '../../index.module.scss';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import { loadClientsAsync } from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { FormCard, SelectCustom } from '@/components';

export const Form = ErrorBoundaryHoc(({ control, receiver, errors }) => {
  const { transportationType, clientDirectionList } = useSelector(state => ({
    transportationType: state.transportation.transportationType,
    clientDirectionList: state.warehouse.clientDirectionList,
  }));
  const [clientSearchType, setClientSearchType] = useState({
    receiver: 'code',
    sender: 'code',
  });
  const { t } = useTranslation();

  return (
    <form className={s.form}>
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
            name="direction"
            options={clientDirectionList}
            labelText={t('direction')}
            placeholder={t('modalCreateClientPlaceholder')}
            error={!!receiver && errors.direction?.message}
          />
        </div>
      </FormCard>
    </form>
  );
});
