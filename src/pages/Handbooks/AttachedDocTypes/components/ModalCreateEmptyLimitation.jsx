import s from '../index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { createEmptyLimitation, fetchDocTypeRule, fetchDocTypes } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEmptyLimitation = ErrorBoundaryHoc(
  ({ isOpen, close, rule, expandedRowId }) => {
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      name: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable(),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      reset,
      register,
      handleSubmit,
      setError,
    } = useForm({ resolver });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(createEmptyLimitation({ ...values, rule })).unwrap();
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

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelConfirm(true)}
        title={t('limitation')}
        contentStyle={{ width: 422 }}
      >
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input labelText={`${t('limitationBy')}`} placeholder={t('byEmpty')} disabled lined />
          <Input
            name="name"
            labelText={t('name').toLowerCase() + ':'}
            errors={errors.name?.message}
            placeholder={t('modalCreateClientPlaceholder')}
            register={register}
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
          title={t('toCancelEmptyLimitationCreation')}
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
