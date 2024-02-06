import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { createRule, fetchDocTypeRule, fetchDocTypes, updateRule } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditRule = ErrorBoundaryHoc(
  ({ isOpen, close, docType, expandedRowId, mode }) => {
    const rule = useSelector(state => state.documents.rule);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      name: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`),
      name_ru: yup.string().max(127, `${t('maxCharactersLength')} 127`),
      name_en: yup.string().max(127, `${t('maxCharactersLength')} 127`),
      name_zh_hans: yup.string().max(127, `${t('maxCharactersLength')} 127`),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      reset,
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
            ? createRule({ ...values, doc_type: docType.id })
            : updateRule({ ...values, doc_type: docType.id })
        ).unwrap();
        await dispatch(fetchDocTypes(searchParams));
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
      if (mode === 'edit' && rule) {
        const { name, name_ru, name_en, name_zh_hans } = rule;
        setValue('name', name);
        if (!i18n.language.match(/en|en-US/)) setValue('name_en', name_en || '');
        if (!i18n.language.match(/ru|ru-RU/)) setValue('name_ru', name_ru || '');
        if (i18n.language !== 'zhHans') setValue('name_zh_hans', name_zh_hans || '');
      }
    }, [rule]);

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelConfirm(true)}
        title={t('rule')}
        contentStyle={{ width: 422 }}
      >
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input labelText={`${t('tableDocType')}:`} placeholder={docType?.name} disabled lined />
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={`${t('ruleName').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('ruleName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('ruleName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('ruleName').toLowerCase()} ${t('inEnglish')}:`}
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
              type="button"
              disabled={loading}
              green={mode === 'edit'}
            />
          </div>
        </form>
        <ModalAction
          title={t(mode === 'create' ? 'toCancelRuleCreation' : 'toCancelRuleEditing', {
            name: docType?.name,
          })}
          description={t(
            mode === 'create' ? 'ruleDataWillNotBeSaved' : 'toCancelRuleEditingDescription'
          )}
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
