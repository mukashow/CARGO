import s from '../index.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { fetchPhoneCode } from '@actions/phone';
import {
  createWarehousePoint,
  fetchPointDirectionsAndRoutes,
  fetchPointList,
  fetchWaypointsAndDirections,
  updateWarehousePoint,
} from '@actions/point';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditWarehousePoint = ErrorBoundaryHoc(
  ({ isOpen, close, mode = 'create', setFieldLabel, expandedPoints }) => {
    const cities = useSelector(state => state.country.cities);
    const warehouses = useSelector(state => state.warehouse.warehouseList);
    const warehousePoint = useSelector(state => state.point.warehousePoint);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasWarehouse, setHasWarehouse] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const { t, i18n } = useTranslation();
    const firstRenderData = useRef(null);
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const schema = yup.object({
      name: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`),
      name_en: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable(),
      name_zh_hans: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable(),
      name_ru: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable(),
      city: yup.lazy((_, { parent }) => {
        if (!parent.warehouse) return yup.object().required(t('fieldShouldBeFilled')).nullable();
        return yup.object().nullable();
      }),
      warehouse: yup.lazy((_, { parent }) => {
        if (!parent.city) return yup.object().required(t('fieldShouldBeFilled')).nullable();
        return yup.object().nullable();
      }),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      register,
      reset,
      control,
      handleSubmit,
      setError,
      setValue,
      watch,
    } = useForm({
      defaultValues: {
        name: '',
        city: null,
        warehouse: null,
      },
      resolver,
    });
    const city = watch('city');

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create'
            ? createWarehousePoint(values)
            : updateWarehousePoint({
                id: warehousePoint.id,
                values,
                firstRenderData: firstRenderData.current,
              })
        ).unwrap();
        await dispatch(fetchWaypointsAndDirections(searchParams));
        expandedPoints.forEach(id => {
          dispatch(fetchPointDirectionsAndRoutes(id));
        });
        dispatch(fetchPointList());
        reset();
        setHasWarehouse(false);
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
      if (warehousePoint && mode === 'edit') {
        const { name_zh_hans, name_en, name_ru, name, city, warehouse } = warehousePoint;
        firstRenderData.current = { name_zh_hans, name_en, name_ru, name, city, warehouse };
        setValue('name', name);
        setValue('warehouse', warehouse);
        setHasWarehouse(!!warehouse);
        setValue('city', city);
        if (i18n.language !== 'zhHans') setValue('name_zh_hans', name_zh_hans);
        if (!i18n.language.match(/en|en-US/)) setValue('name_en', name_en);
        if (!i18n.language.match(/ru|ru-RU/)) setValue('name_ru', name_ru);
      }
    }, [warehousePoint]);

    useEffect(() => {
      if (!hasWarehouse) {
        setValue('city', warehousePoint?.city);
      }
    }, [hasWarehouse]);

    useEffect(() => {
      if (isOpen) {
        dispatch(fetchPhoneCode());
      }
    }, [isOpen]);

    return (
      <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('warehousePoint')}>
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={setFieldLabel('waypointName')}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          {(!city || mode === 'edit') && (
            <SelectCustom
              name="warehouse"
              options={warehouses || []}
              getOptionLabel={option => option.name}
              getOptionValue={option => option.id}
              control={control}
              error={errors.warehouse?.message}
              labelText={t('warehouse')}
              placeholder={t('modalCreateClientPlaceholderSelectRequired')}
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={option => {
                if (option) setValue('city', null);
                setHasWarehouse(!!option);
              }}
            />
          )}
          {!hasWarehouse && (
            <SelectCustom
              name="city"
              options={cities || []}
              getOptionLabel={option => option.name}
              getOptionValue={option => option.id}
              control={control}
              error={errors.city?.message}
              labelText={`${t('city')}:`}
              placeholder={t('selectRequired')}
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={option => {
                if (option) setValue('warehouse', null);
              }}
            />
          )}
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('cityName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('cityName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('cityName').toLowerCase()} ${t('inEnglish')}:`}
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
          title={t(mode === 'create' ? 'toCancelPointCreation' : 'toCancelPointEditing')}
          description={t('pointDataWillNotBeSaved')}
          isOpen={cancelConfirm || backModalOpen}
          onCancel={() => {
            setCancelConfirm(false);
            onCancel();
          }}
          onSubmit={() => {
            setCancelConfirm(false);
            backConfirm();
            reset();
            setHasWarehouse(false);
            close();
          }}
        />
      </Modal>
    );
  }
);
