import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Modal, ModalAction, SelectCustom } from '@/components';
import { fetchFilterDirectionList } from '@actions/goods';
import { fetchPhoneCode } from '@actions/phone';
import {
  createDirection,
  fetchDirections,
  fetchDirectionsFilter,
  updateDirection,
} from '@actions/point';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditDirection = ErrorBoundaryHoc(({ isOpen, close, mode = 'create' }) => {
  const countries = useSelector(state => state.phone.phoneCode);
  const { pointList, direction } = useSelector(state => ({
    pointList: state.point.pointList,
    direction: state.point.direction,
  }));
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const schema = yup.object({
    point_from: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    point_to: yup.object().required(t('fieldShouldBeFilled')).nullable(),
  });
  const resolver = useYupValidationResolver(schema);
  const {
    formState: { errors },
    reset,
    control,
    handleSubmit,
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      point_from: null,
      point_to: null,
      custom_clearance_country: null,
    },
    resolver,
  });

  const onSubmit = async values => {
    setLoading(true);
    try {
      await dispatch(
        mode === 'create' ? createDirection(values) : updateDirection({ values, id: direction?.id })
      ).unwrap();
      dispatch(fetchDirections(searchParams));
      dispatch(fetchDirectionsFilter());
      dispatch(fetchFilterDirectionList());
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
    if (direction && mode === 'edit') {
      const {
        point_from,
        point_from_name,
        point_to,
        point_to_name,
        custom_clearance_country,
        custom_clearance_country_name,
      } = direction;
      setValue('point_from', { id: point_from, name: point_from_name });
      setValue('point_to', { id: point_to, name: point_to_name });
      setValue(
        'custom_clearance_country',
        custom_clearance_country
          ? {
              id: custom_clearance_country,
              name: custom_clearance_country_name,
            }
          : null
      );
    }
  }, [direction, mode]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPhoneCode());
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('directionFilter')}>
      <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
        <SelectCustom
          name="point_from"
          options={pointList || []}
          getOptionLabel={option => option.name}
          getOptionValue={option => option.id}
          control={control}
          error={errors.point_from?.message}
          labelText={`${t('fromPoint').toLowerCase()}:`}
          placeholder={t('selectRequired')}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        <SelectCustom
          name="point_to"
          options={pointList || []}
          getOptionLabel={option => option.name}
          getOptionValue={option => option.id}
          control={control}
          error={errors.point_to?.message}
          labelText={`${t('toPoint').toLowerCase()}:`}
          placeholder={t('selectRequired')}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        <SelectCustom
          name="custom_clearance_country"
          options={countries}
          getOptionLabel={option => option.name}
          getOptionValue={option => option.id}
          control={control}
          error={errors.custom_clearance_country?.message}
          labelText={`${t('customCountry').toLowerCase()}:`}
          placeholder={t('modalCreateClientPlaceholderSelectRequired')}
          menuPortalTarget={document.body}
          menuPosition="fixed"
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
        title={t(mode === 'create' ? 'toCancelDirectionCreation' : 'toCancelDirectionEditing')}
        description={t('toCancelDirectionCreationDescription')}
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
