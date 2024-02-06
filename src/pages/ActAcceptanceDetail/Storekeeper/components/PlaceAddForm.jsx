import React, { useEffect, useMemo, useState } from 'react';
import s from '../../index.module.scss';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import * as yup from 'yup';
import { Button, Icon, Input, ModalAction, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import { createPlace, updatePlace } from '@actions/goods';

export const PlaceAddForm = ErrorBoundaryHoc(
  ({ onViewPlace, isEditMode = false, placeId = '', setEditMode, defaultValues }) => {
    const { goodsTypeWithTnved, goods, tnvedId } = useSelector(state => ({
      goodsTypeWithTnved: state.goods.goodsTypeWithTnved,
      goods: state.goods.goodsDetail.total_of_goods_by_type,
      tnvedId: state.goods.placesByTnved?.tnved_id,
    }));
    const [printImgSrc, setPrintImgSrc] = useState('');
    const [updatePlaceId, setUpdatePlaceId] = useState(placeId);
    const [isNextSeat, setIsNextSeat] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUpdateMode, setIsUpdateMode] = useState(isEditMode);
    const { actId } = useParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const selectSchema = yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .default(undefined)
      .required(t('fieldShouldBeFilled'))
      .nullable();
    const validationSchema = yup.object({
      id_goods_type: selectSchema,
      id_tnved: selectSchema,
      weight: yup
        .number()
        .required(t('fieldShouldBeFilled'))
        .typeError(t('enterNumber'))
        .positive(`${t('valueMustBeGreaterThan')} 0`)
        .transform((_value, originalValue) =>
          originalValue ? Number(originalValue.replace(/,/g, '.')) : originalValue
        )
        .nullable(),
      volume: yup
        .number()
        .required(t('fieldShouldBeFilled'))
        .typeError(t('enterNumber'))
        .positive(`${t('valueMustBeGreaterThan')} 0`)
        .transform((_value, originalValue) =>
          originalValue ? Number(originalValue.replace(/,/g, '.')) : originalValue
        )
        .nullable(),
      pieces: yup.lazy(value =>
        value === ''
          ? yup.string()
          : yup
              .number()
              .typeError(t('enterNumber'))
              .min(0, t('canNotBeNegative'))
              .transform((_value, originalValue) =>
                originalValue ? Number(originalValue.replace(/,/g, '.')) : originalValue
              )
              .nullable()
      ),
    });

    const resolver = useYupValidationResolver(validationSchema);
    const {
      handleSubmit,
      register,
      control,
      formState: { errors, isDirty },
      setValue,
      setError,
      watch,
      resetField,
    } = useForm({
      resolver,
      defaultValues: defaultValues || {
        id_goods_type: null,
        id_tnved: null,
        weight: null,
        volume: null,
        pieces: null,
      },
    });

    const [isBackModalOpen, onConfirm, onCancel] = useConfirmNavigate(isDirty);
    const id_goods_type = watch('id_goods_type');
    const id_tnved = watch('id_tnved');

    const goodsType = useMemo(() => {
      if (!goodsTypeWithTnved) return [];
      return goodsTypeWithTnved.map(({ id, name, ...rest }) => ({
        label: name,
        value: id,
        ...rest,
      }));
    }, [goodsTypeWithTnved]);

    const tnVedCode = useMemo(() => {
      if (!id_goods_type) return [];
      return id_goods_type.tnved_list.map(({ code, id, name }) => ({
        label: code,
        value: id,
        subtitle: name,
      }));
    }, [id_goods_type]);

    const onSubmit = values => {
      setLoading(true);
      if (isUpdateMode) {
        return dispatch(updatePlace({ ...values, id: updatePlaceId, actId, isEditMode }))
          .unwrap()
          .then(qr => {
            setPrintImgSrc('data:image/png;base64,' + qr);
            setTimeout(() => window.print(), 0);
            setEditMode(false);
          })
          .catch(errors => {
            for (const error in errors) {
              setError(error, { type: 'custom', message: errors[error] });
            }
          })
          .finally(() => setLoading(false));
      }
      dispatch(createPlace({ ...values, actId }))
        .unwrap()
        .then(({ qr, id }) => {
          setPrintImgSrc('data:image/png;base64,' + qr);
          setTimeout(() => window.print(), 0);
          setIsNextSeat(true);
          setIsUpdateMode(true);
          setUpdatePlaceId(id);
        })
        .catch(errors => {
          for (const error in errors) {
            setError(error, { type: 'custom', message: errors[error] });
          }
        })
        .finally(() => setLoading(false));
    };

    const onResetFields = () => {
      setIsNextSeat(false);
      setIsUpdateMode(false);
      resetField('weight');
      resetField('volume');
      resetField('pieces');
    };

    useEffect(() => {
      if (isEditMode && defaultValues?.id_goods_type.value === id_goods_type.value) return;
      setValue('id_tnved', null);
    }, [id_goods_type]);

    useEffect(() => {
      for (const key in defaultValues) {
        setValue(key, defaultValues[key]);
      }
    }, [defaultValues]);

    useEffect(() => {
      setUpdatePlaceId(placeId);
    }, [placeId]);

    useEffect(() => {
      if (tnvedId && goods) {
        if (!goods.some(({ tnved_id }) => tnvedId === tnved_id)) {
          onResetFields();
        }
      }
    }, [goods, tnvedId]);

    return (
      <div className={clsx(s.goodsFilterWrap, isEditMode && s.inModal)}>
        {isEditMode && (
          <Icon iconId="cross" iconClass={s.close} clickable onClick={() => setEditMode(false)} />
        )}
        <ModalAction
          isOpen={isBackModalOpen}
          onSubmit={onConfirm}
          onCancel={onCancel}
          title={t('confirmCancelAction')}
        />
        <div className={s.printImgWrap}>
          <img className={s.printImg} src={printImgSrc} alt="QR" />
        </div>
        <div>
          <div className={s.goodsFilter}>
            {isEditMode && (
              <div>
                <Input
                  small
                  thinLabel
                  labelText={t('seatNumber')}
                  inputDisabled
                  value={`#${placeId}`}
                />
              </div>
            )}
            <SelectCustom
              control={control}
              name="id_goods_type"
              options={goodsType}
              labelText={t('goodsType')}
              placeholder=""
              small
              thinLabel
              error={errors.id_goods_type?.message}
            />
            <SelectCustom
              withSubtitle
              maxContentMenu
              getOptionLabel={option => option.subtitle}
              control={control}
              name="id_tnved"
              options={tnVedCode}
              labelText={t('tnVedCode')}
              placeholder=""
              small
              thinLabel
              error={errors.id_tnved?.message}
            />
            <div>
              <Input
                small
                thinLabel
                labelText={t('weight')}
                register={register}
                name="weight"
                errors={errors.weight?.message}
              />
            </div>
            <div>
              <Input
                small
                thinLabel
                labelText={t('volume')}
                register={register}
                name="volume"
                errors={errors.volume?.message}
              />
            </div>
            <div>
              <Input
                small
                thinLabel
                labelText={t('pieces')}
                register={register}
                name="pieces"
                errors={errors.pieces?.message}
              />
            </div>
          </div>
          <div className={s.buttons}>
            <Button
              isSmall
              className={s.button}
              value={t(isUpdateMode ? 'updateAndPrintBarcode' : 'printBarcode')}
              isBlue
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            />
            {isNextSeat && (
              <Button
                isSmall
                className={s.button}
                value={t('nextSeat')}
                isOrange
                onClick={onResetFields}
                style={{ width: 199 }}
              />
            )}
          </div>
        </div>
        <div>
          {id_tnved && !isEditMode && (
            <Icon
              iconId="menuList"
              color="#0B6BE6"
              clickable
              onClick={() => onViewPlace(id_tnved.value)}
            />
          )}
        </div>
      </div>
    );
  }
);
