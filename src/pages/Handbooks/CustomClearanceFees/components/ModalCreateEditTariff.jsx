import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createCustomClearanceTariff,
  fetchCustomClearanceTariffs,
  fetchPhoneCode,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditTariff = ErrorBoundaryHoc(({ isOpen, close, mode = 'create' }) => {
  const countries = useSelector(state => state.phone.phoneCode);
  const { goodsType, tariff } = useSelector(state => ({
    goodsType: state.tariff.goodsType,
    tariff: state.tariff.customClearanceTariff,
  }));
  const transportationType = useSelector(state => state.transportation.transportationType);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const numberSchema = yup
    .number()
    .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
    .nullable()
    .typeError(t('enterNumber'))
    .transform((_value, originalValue) =>
      originalValue ? Number(String(originalValue).replace(/,/g, '.')) : originalValue
    );
  const schema = yup.object({
    transportation_type: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    custom_clearance_country: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    goods_type: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    for_piece: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    price: yup.lazy(value =>
      value === ''
        ? yup.string().required(t('fieldShouldBeFilled'))
        : numberSchema.required(t('fieldShouldBeFilled'))
    ),
    additional_price: yup.lazy(value => (value === '' ? yup.string() : numberSchema)),
  });
  const resolver = useYupValidationResolver(schema);
  const {
    formState: { errors },
    reset,
    register,
    control,
    handleSubmit,
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      additional_price: null,
    },
    resolver,
  });

  const onSubmit = async values => {
    setLoading(true);
    try {
      await dispatch(createCustomClearanceTariff(values)).unwrap();
      dispatch(fetchCustomClearanceTariffs(searchParams));
      reset();
      close();
    } catch (errors) {
      for (const key in errors) {
        setError(key, { message: errors[key] });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && transportationType && mode === 'create') {
      const transportation_type = transportationType.find(
        ({ value }) => value === +searchParams.get('transportation_type')
      );
      const country = countries.find(({ id }) => id === +searchParams.get('country'));
      setValue('transportation_type', transportation_type);
      setValue(
        'custom_clearance_country',
        country ? { label: country.name, value: country.id } : null
      );
    }
  }, [isOpen, transportationType, countries]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPhoneCode());
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'edit' && tariff) {
      const {
        additional_price,
        price,
        for_piece,
        transportation_type,
        custom_clearance_country,
        goods_type,
      } = tariff;
      const foundGoodsType = goodsType?.find(({ id }) => id === goods_type);
      const country = countries.find(({ id }) => id === custom_clearance_country);
      const foundTransportationType = transportationType.find(
        ({ value }) => value === transportation_type
      );
      setValue('transportation_type', foundTransportationType);
      setValue(
        'custom_clearance_country',
        country ? { label: country.name, value: country.id } : null
      );
      setValue(
        'goods_type',
        foundGoodsType ? { label: foundGoodsType.name, value: foundGoodsType.id } : null
      );
      setValue('price', price);
      setValue('additional_price', additional_price);
      setValue(
        'for_piece',
        for_piece ? { label: t('yes'), value: true } : { label: t('no'), value: false }
      );
    }
  }, [tariff]);

  return (
    <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('customsClearanceFees')}>
      <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
        <SelectCustom
          options={transportationType}
          control={control}
          name="transportation_type"
          labelText={t('transportationType')}
          placeholder={t('selectRequired')}
          error={errors.transportation_type?.message}
        />
        <SelectCustom
          options={countries.map(({ id, name }) => ({ label: name, value: id }))}
          control={control}
          name="custom_clearance_country"
          labelText={`${t('clientCountry')}:`}
          placeholder={t('selectRequired')}
          error={errors.custom_clearance_country?.message}
        />
        <SelectCustom
          options={goodsType?.map(({ id, name }) => ({ label: name, value: id }))}
          control={control}
          name="goods_type"
          labelText={`${t('goodsTypeFilter').toLowerCase()}:`}
          placeholder={t('selectRequired')}
          error={errors.goods_type?.message}
        />
        <SelectCustom
          options={[
            { label: t('yes'), value: true },
            { label: t('no'), value: false },
          ]}
          control={control}
          name="for_piece"
          labelText={`${t('perUnitBilling')}:`}
          placeholder={t('selectRequired')}
          error={errors.for_piece?.message}
        />
        <Input
          register={register}
          name="price"
          labelText={`${t('cost').toLowerCase()}:`}
          placeholder={t('modalCreateClientPlaceholder')}
          errors={errors.price?.message}
        />
        <Input
          register={register}
          name="additional_price"
          labelText={`${t('markup').toLowerCase()}:`}
          placeholder={t('modalCreateClientPlaceholderRequired')}
          errors={errors.additional_price?.message}
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
        title={t(mode === 'create' ? 'toCancelTariffCreation' : 'toCancelTariffEditing')}
        description={t('tariffDataWillNotBeSaved')}
        isOpen={cancelConfirm || backModalOpen}
        onCancel={() => {
          setCancelConfirm(false);
          onCancel();
        }}
        onSubmit={() => {
          setCancelConfirm(false);
          backConfirm();
          reset();
          close();
        }}
      />
    </Modal>
  );
});
