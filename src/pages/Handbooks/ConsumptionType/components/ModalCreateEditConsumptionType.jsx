import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createConsumptionType,
  fetchConsumptionDocType,
  fetchConsumptionType,
  updateConsumptionType,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditConsumptionType = ErrorBoundaryHoc(
  ({ isOpen, close, mode = 'create' }) => {
    const consumptionType = useSelector(state => state.documents.consumptionTypeOne);
    const docType = useSelector(state => state.documents.consumptionDocType);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();

    const prefixName = yup.lazy((_, { path }) => {
      const schema = yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable();
      if (mode === 'edit' && path in dirtyFields) {
        return schema.concat(yup.string().required(t('fieldShouldBeFilled')));
      }
      return schema;
    });

    const schema = yup.object({
      name: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`),
      doc_type: yup.object().required(t('fieldShouldBeFilled')),
      name_ru: prefixName,
      name_en: prefixName,
      name_zh_hans: prefixName,
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors, dirtyFields },
      reset,
      control,
      register,
      handleSubmit,
      setError,
      setValue,
    } = useForm({ resolver });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create'
            ? createConsumptionType(values)
            : updateConsumptionType({ ...values, id: consumptionType.id })
        ).unwrap();
        dispatch(fetchConsumptionType(searchParams));
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
      if (consumptionType && mode === 'edit') {
        const { name, name_en, name_ru, name_zh_hans, doc_type } = consumptionType;
        setValue('name', name);
        setValue('doc_type', doc_type);
        if (name_en && !i18n.language.match(/en-US|en/)) setValue('name_en', name_en);
        if (name_ru && !i18n.language.match(/ru-RU|ru/)) setValue('name_ru', name_ru);
        if (name_zh_hans && i18n.language !== 'zhHans') setValue('name_zh_hans', name_zh_hans);
      }
    }, [consumptionType]);

    useEffect(() => {
      if (isOpen) dispatch(fetchConsumptionDocType());
    }, [isOpen]);

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelConfirm(true)}
        title={t('additionalConsumption')}
      >
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={`${t('consumptionTypeName').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <SelectCustom
            labelText={`${t('docTypesAcceptedConsumption').toLowerCase()}:`}
            control={control}
            name="doc_type"
            placeholder={t('selectRequired')}
            error={errors.doc_type?.message}
            options={docType}
            getOptionValue={option => option.id}
            getOptionLabel={option => option.name}
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('consumptionTypeName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('consumptionTypeName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('consumptionTypeName').toLowerCase()} ${t('inEnglish')}:`}
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
          title={t(
            mode === 'create' ? 'toCancelConsumptionCreation' : 'toCancelConsumptionCreation'
          )}
          description={t('toCancelConsumptionCreationDescription')}
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
  }
);
