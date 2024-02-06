import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createPhoneType,
  fetchPhoneType,
  fetchPhoneTypes,
  fetchPhoneTypesFilter,
  updatePhoneType,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditPhoneType = ErrorBoundaryHoc(({ isOpen, close, mode = 'create' }) => {
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const phoneType = useSelector(state => state.phone.phoneTypeOne);
  const [loading, setLoading] = useState(false);
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const schema = yup.object({
    name: yup
      .string()
      .required(t('fieldShouldBeFilled'))
      .max(20, `${t('maxCharactersLength')} 20`),
    name_ru: yup
      .string()
      .max(20, `${t('maxCharactersLength')} 20`)
      .nullable(),
    name_en: yup
      .string()
      .max(20, `${t('maxCharactersLength')} 20`)
      .nullable(),
    name_zh_hans: yup
      .string()
      .max(20, `${t('maxCharactersLength')} 20`)
      .nullable(),
  });
  const resolver = useYupValidationResolver(schema);
  const {
    formState: { errors },
    reset,
    register,
    handleSubmit,
    setError,
    setValue,
  } = useForm({
    defaultValues: { name: '', name_en: null, name_ru: null, name_zh_hans: null },
    resolver,
  });

  const onSubmit = async values => {
    setLoading(true);
    try {
      await dispatch(
        mode === 'create'
          ? createPhoneType(values)
          : updatePhoneType({ ...values, id: phoneType.id })
      ).unwrap();
      dispatch(fetchPhoneTypes(searchParams));
      dispatch(fetchPhoneTypesFilter());
      dispatch(fetchPhoneType());
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
    if (phoneType && mode === 'edit') {
      const { name, name_en, name_ru, name_zh_hans } = phoneType;
      setValue('name', name);
      if (name_en && !i18n.language.match(/en-US|en/)) setValue('name_en', name_en || null);
      if (name_ru && !i18n.language.match(/ru-RU|ru/)) setValue('name_ru', name_ru || null);
      if (name_zh_hans && i18n.language !== 'zhHans')
        setValue('name_zh_hans', name_zh_hans || null);
    }
  }, [phoneType]);

  return (
    <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('phoneNumberType')}>
      <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
        <Input
          name="name"
          register={register}
          errors={errors.name?.message}
          labelText={`${t('phoneNumberType').toLowerCase()}:`}
          placeholder={t('modalCreateClientPlaceholder')}
        />
        {i18n.language !== 'zhHans' && (
          <Input
            name="name_zh_hans"
            register={register}
            errors={errors.name_zh_hans?.message}
            labelText={`${t('phoneNumberType').toLowerCase()} ${t('inChinese')}:`}
            placeholder={t('enterValueOptional')}
          />
        )}
        {!i18n.language.match(/ru|ru-RU/) && (
          <Input
            name="name_ru"
            register={register}
            errors={errors.name_ru?.message}
            labelText={`${t('phoneNumberType').toLowerCase()} ${t('inRussian')}:`}
            placeholder={t('enterValueOptional')}
          />
        )}
        {!i18n.language.match(/en|en-US/) && (
          <Input
            name="name_en"
            register={register}
            errors={errors.name_en?.message}
            labelText={`${t('phoneNumberType').toLowerCase()} ${t('inEnglish')}:`}
            placeholder={t('enterValueOptional')}
          />
        )}
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
        title={t(mode === 'create' ? 'toCancelPhoneTypeCreation' : 'toCancelPhoneTypeEditing')}
        description={t('phoneTypeDataWillNotBeSaved')}
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
