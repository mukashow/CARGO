import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { createDocType, fetchDocTypeRule, fetchDocTypes, updateDocType } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditDocType = ErrorBoundaryHoc(
  ({ isOpen, close, mode = 'create', expandedRowId }) => {
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const docType = useSelector(state => state.documents.docType);
    const [loading, setLoading] = useState(false);
    const [dirty, setDirty] = useState(null);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();

    const numberSchema = yup.lazy(value => {
      if (value === '') {
        return yup.string().required(t('fieldShouldBeFilled'));
      }
      return yup
        .number()
        .typeError(t('enterNumber'))
        .required(t('fieldShouldBeFilled'))
        .integer(t('typeInteger'))
        .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
        .transform((_value, originalValue) => Number(String(originalValue).replace(/,/g, '.')));
    });
    const setRequired = name => {
      if (dirty && dirty[name] && mode === 'edit') {
        return yup.string().required(t('fieldShouldBeFilled'));
      }
      return yup.string();
    };
    const schema = yup.object({
      name: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`),
      name_ru: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .concat(setRequired('name_ru')),
      name_en: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .concat(setRequired('name_en')),
      name_zh_hans: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .concat(setRequired('name_zh_hans')),
      max_size: numberSchema,
      max_count: numberSchema,
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors, dirtyFields },
      reset,
      register,
      handleSubmit,
      setError,
      setValue,
    } = useForm({
      defaultValues: {
        name: '',
        max_size: '',
        max_count: '',
      },
      resolver,
    });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create' ? createDocType(values) : updateDocType({ ...values, id: docType.id })
        ).unwrap();
        dispatch(fetchDocTypes(searchParams));
        if (expandedRowId) dispatch(fetchDocTypeRule(expandedRowId));
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
      if (docType && mode === 'edit') {
        const { name, name_en, name_ru, name_zh_hans, max_size, max_count } = docType;
        setValue('name', name);
        setValue('max_size', max_size);
        setValue('max_count', max_count);
        if (name_en && !i18n.language.match(/en-US|en/)) setValue('name_en', name_en);
        if (name_ru && !i18n.language.match(/ru-RU|ru/)) setValue('name_ru', name_ru);
        if (name_zh_hans && i18n.language !== 'zhHans') setValue('name_zh_hans', name_zh_hans);
      }
    }, [docType]);

    useEffect(() => {
      setDirty(dirtyFields);
    }, [dirtyFields]);

    return (
      <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('attachedDocType')}>
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={`${t('tableDocType')}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('tableDocType').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('tableDocType').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('tableDocType').toLowerCase()} ${t('inEnglish')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          <Input
            name="max_size"
            register={register}
            errors={errors.max_size?.message}
            labelText={`${t('maxDocSize')}:`}
            placeholder={t('modalCreateClientPlaceholder')}
            endText={i18n.language.match(/ru-RU|ru/) ? 'мб' : 'mb'}
          />
          <Input
            name="max_count"
            register={register}
            errors={errors.max_count?.message}
            labelText={`${t('maxDocTypeCount')}:`}
            placeholder={t('modalCreateClientPlaceholder')}
            endText={t('piece')}
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
          title={t(mode === 'create' ? 'toCancelDocTypeCreation' : 'toCancelDocTypeEditing')}
          description={t('toCancelDocTypeCreationDescription')}
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
