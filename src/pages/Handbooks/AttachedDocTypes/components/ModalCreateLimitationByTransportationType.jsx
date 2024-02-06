import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createTransportationTypeLimitation,
  fetchDocTypeRule,
  fetchDocTypes,
  fetchTransportationType,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateLimitationByTransportationType = ErrorBoundaryHoc(
  ({ isOpen, close, rule, expandedRowId }) => {
    const transportationType = useSelector(state => state.transportation.transportationType);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      transportation_type: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      reset,
      control,
      handleSubmit,
      setError,
    } = useForm({ resolver });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(createTransportationTypeLimitation({ ...values, rule })).unwrap();
        await dispatch(fetchDocTypes(searchParams));
        await dispatch(fetchDocTypeRule(expandedRowId));
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
      if (isOpen) dispatch(fetchTransportationType());
    }, [isOpen]);

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelConfirm(true)}
        title={t('limitation')}
        contentStyle={{ width: 422 }}
      >
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            labelText={`${t('limitationBy')}`}
            placeholder={t('byTransportationType')}
            disabled
            lined
          />
          <SelectCustom
            options={transportationType}
            name="transportation_type"
            labelText={t('transportationType')}
            error={errors.transportation_type?.message}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            control={control}
            placeholder={t('selectRequired')}
          />
          <div className={s.footer}>
            <Button
              onClick={() => setCancelConfirm(true)}
              textButton
              value={t('modalConfirmLabelCancel')}
              style={{ fontSize: 16 }}
            />
            <Button value={t('modalConfirmLabelConfirm')} isBlue type="button" disabled={loading} />
          </div>
        </form>
        <ModalAction
          title={t('toCancelLimitationCreationByTransportationType')}
          description={t('limitationDataWillNotBeSaved')}
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
