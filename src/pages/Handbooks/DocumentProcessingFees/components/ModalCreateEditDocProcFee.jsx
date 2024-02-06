import React, { useEffect, useState } from 'react';
import s from '../index.module.scss';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import {
  createDocProcessingFee,
  fetchClientDocProcessingFees,
  fetchDocProcessingFees,
  fetchPhoneCode,
  loadClientsAsync,
} from '@/store/actions';

export const ModalCreateEditDocProcFee = ({ isOpen, close, mode = 'create', type }) => {
  const docFee = useSelector(state => state.tariff.clientDocFee);
  const countries = useSelector(state => state.phone.phoneCode);
  const transportationType = useSelector(state => state.transportation.transportationType);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const schema = yup.object({
    transportation_type: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    percent: yup.lazy(value =>
      value === ''
        ? yup.string().required(t('fieldShouldBeFilled'))
        : yup
            .number()
            .typeError(t('enterNumber'))
            .required(t('fieldShouldBeFilled'))
            .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
            .transform((_value, originalValue) =>
              originalValue ? Number(String(originalValue).replace(/,/g, '.')) : originalValue
            )
            .nullable()
    ),
  });

  const resolver = useYupValidationResolver(schema);
  const {
    register,
    control,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: {
      percent: '',
    },
  });

  const onSubmit = async values => {
    setLoading(true);
    try {
      await dispatch(createDocProcessingFee(values)).unwrap();
      dispatch(fetchClientDocProcessingFees(searchParams));
      dispatch(fetchDocProcessingFees(searchParams));
      reset();
      close();
    } catch (errors) {
      for (const key in errors) {
        setError(key, { message: errors[key], type: 'custom' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        const transportation_type = transportationType.find(
          ({ value }) => value === +searchParams.get('transportation_type_id')
        );
        setValue('transportation_type', transportation_type);

        const country = countries.find(({ id }) => id === +searchParams.get('country_id'));
        if (country) {
          setValue('custom_clearance_country', { label: country.name, value: country.id });
        }
      }

      if (mode === 'edit' && docFee) {
        setValue('percent', docFee.percent);
        setValue(
          'transportation_type',
          transportationType.find(({ value }) => value === docFee.transportation_type)
        );
        const country = countries.find(({ id }) => id === docFee.custom_clearance_country);
        setValue(
          'custom_clearance_country',
          country ? { label: country.name, value: country.id } : null
        );
        setValue('client', { label: docFee.client_code, value: docFee.client });
      }
    }
  }, [isOpen, docFee, transportationType, countries]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPhoneCode());
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      close={() => setCancelConfirm(true)}
      title={t('docProcessingFees')}
      contentStyle={{ maxWidth: 422, width: '100%' }}
    >
      <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
        <SelectCustom
          options={transportationType}
          name="transportation_type"
          control={control}
          labelText={t('transportationType')}
          placeholder={t('selectRequired')}
          error={errors.transportation_type?.message}
        />
        <SelectCustom
          options={countries.map(({ id, name }) => ({ label: name, value: id }))}
          name="custom_clearance_country"
          control={control}
          labelText={`${t('clientCountry')}:`}
          placeholder={t('modalCreateClientPlaceholderSelectRequired')}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          error={errors.country?.message}
        />
        {type === 'forClient' && (
          <SelectCustom
            async
            loadOptions={loadClientsAsync}
            name="client"
            control={control}
            labelText={`${t('clientCodeClient')}:`}
            placeholder={t('modalCreateClientPlaceholderSelectRequired')}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            error={errors.code?.message}
          />
        )}
        <Input
          register={register}
          name="percent"
          labelText={`${t('percent')}:`}
          placeholder={t('modalCreateClientPlaceholder')}
          errors={errors.percent?.message}
        />
        <div className={s.footer}>
          <Button
            onClick={() => setCancelConfirm(true)}
            textButton
            value={t('modalConfirmLabelCancel')}
            style={{ fontSize: 16 }}
          />
          <Button
            value={t(mode === 'create' ? 'modalConfirmLabelConfirm' : 'save')}
            isBlue={mode === 'create'}
            green={mode === 'edit'}
            type="button"
            disabled={loading}
          />
        </div>
      </form>
      <ModalAction
        isOpen={cancelConfirm || backModalOpen}
        title={t(mode === 'create' ? 'toCancelTariffCreation' : 'toCancelTariffEditing')}
        description={t('tariffDataWillNotBeSaved')}
        onCancel={() => {
          setCancelConfirm(false);
          onCancel();
        }}
        onSubmit={() => {
          close();
          reset();
          backConfirm();
          setCancelConfirm(false);
        }}
      />
    </Modal>
  );
};
