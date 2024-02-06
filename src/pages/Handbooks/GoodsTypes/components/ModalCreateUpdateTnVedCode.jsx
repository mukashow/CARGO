import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { createTnved, fetchGoodsType, fetchGoodsTypeTnved, updateTnved } from '@actions/goods';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateUpdateTnVedCode = ErrorBoundaryHoc(
  ({ isOpen, close, setFieldLabel, mode = 'create', goodsType, tnved, expandedCargo }) => {
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      name: yup.string().required(t('fieldShouldBeFilled')),
      code: yup.string().required(t('fieldShouldBeFilled')),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      register,
      reset,
      handleSubmit,
      setError,
      setValue,
    } = useForm({
      defaultValues: { name: '', name_zh_hans: null, name_ru: null, name_en: null, code: '' },
      resolver,
    });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create'
            ? createTnved({ ...values, goods_type: goodsType.current.id })
            : updateTnved({ id: tnved.id, values })
        ).unwrap();
        reset();
        close();
        await dispatch(fetchGoodsType(searchParams));
        expandedCargo.forEach(id => {
          dispatch(fetchGoodsTypeTnved(id));
        });
      } catch (errors) {
        for (const key in errors) {
          setError(key, { message: errors[key] });
        }
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (mode === 'edit' && tnved) {
        setValue('name', tnved.name);
        setValue('code', tnved.code);
        setValue('goods_type', tnved.goods_type.id);
        setValue('name_ru', !i18n.language.match(/ru|ru-RU/) ? tnved.name_ru : null);
        setValue('name_en', !i18n.language.match(/en|en-US/) ? tnved.name_en : null);
        setValue('name_zh_hans', i18n.language !== 'zhHans' ? tnved.name_zh_hans : null);
      }
    }, [tnved]);

    return (
      <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('tnVedCode')}>
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <SelectCustom
            name="goods_type"
            value={{ label: goodsType?.current?.name || tnved?.goods_type.name }}
            errors={errors.goods_type?.message}
            labelText={`${t('goodsTypeFilter').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
            options={[]}
            isDisabled
            lined
          />
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={setFieldLabel('tnVedCode').replace(
              t('tnVedCode').toLowerCase(),
              t('tnVedCode')
            )}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('tnVedCode')} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('tnVedCode')} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('tnVedCode')} ${t('inEnglish')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          <Input
            name="code"
            register={register}
            errors={errors.code?.message}
            labelText={t('code')}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <div className={s.footer}>
            <Button
              onClick={() => setCancelConfirm(true)}
              textButton
              value={t('modalConfirmLabelCancel')}
              style={{ fontSize: 16 }}
            />
            <Button
              type="button"
              value={t(mode === 'create' ? 'modalConfirmLabelConfirm' : 'save')}
              isBlue={mode === 'create'}
              green={mode === 'edit'}
              disabled={loading}
            />
          </div>
        </form>
        <ModalAction
          title={t(mode === 'create' ? 'toCancelTnVedCodeCreation' : 'toCancelTnVedCodeEditing')}
          description={t('tnVedCodeWillNotBeSaved')}
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
