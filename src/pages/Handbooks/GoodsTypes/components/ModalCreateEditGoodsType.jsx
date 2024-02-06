import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import { fetchLoadingListGoodsType } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import {
  createGoodsType,
  fetchFilterGoodsType,
  fetchGoodsTypeTnved,
  updateGoodsType,
} from '@actions/goods';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditGoodsType = ErrorBoundaryHoc(
  ({ isOpen, close, setFieldLabel, mode = 'create', goodsType, expandedCargo }) => {
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
      symbol: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .matches(/^[a-zA-Z ]*$/, t('onlyLatinCharacters'))
        .max(4, `${t('maxCharactersLength')} 4`),
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
      defaultValues: { name: '', name_zh_hans: null, name_ru: null, name_en: null, symbol: '' },
      resolver,
    });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create'
            ? createGoodsType({ values, searchParams })
            : updateGoodsType({ id: goodsType.id, values, searchParams })
        ).unwrap();
        reset();
        close();
        expandedCargo.forEach(id => {
          dispatch(fetchGoodsTypeTnved(id));
        });
        dispatch(fetchFilterGoodsType());
        dispatch(fetchLoadingListGoodsType());
      } catch (errors) {
        for (const key in errors) {
          setError(key, { message: errors[key] });
        }
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (mode === 'edit' && goodsType && isOpen) {
        setValue('name', goodsType.name);
        setValue('name_ru', !i18n.language.match(/ru|ru-RU/) ? goodsType.name_ru : null);
        setValue('name_en', !i18n.language.match(/en|en-US/) ? goodsType.name_en : null);
        setValue('name_zh_hans', i18n.language !== 'zhHans' ? goodsType.name_zh_hans : null);
        setValue('symbol', goodsType.symbol);
      }
    }, [goodsType, isOpen]);

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelConfirm(true)}
        title={uppercase(t('goodsTypeFilter'))}
      >
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={setFieldLabel('goodsTypeName')}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('goodsTypeName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('goodsTypeName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('goodsTypeName').toLowerCase()} ${t('inEnglish')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          <Input
            name="symbol"
            register={register}
            errors={errors.symbol?.message}
            labelText={`${t('codeLetter').toLowerCase()}:`}
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
          title={t(mode === 'create' ? 'toCancelGoodsTypeCreation' : 'toCancelGoodsTypeEditing')}
          description={t('toCancelGoodsTypeCreationDescription')}
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
