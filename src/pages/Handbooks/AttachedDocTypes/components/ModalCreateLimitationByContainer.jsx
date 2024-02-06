import s from '../index.module.scss';
import inputStyle from '@/components/Forms/Input/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import {
  createContainerLimitation,
  fetchContractType,
  fetchDocTypeRule,
  fetchDocTypes,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, Checkbox, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateLimitationByContainer = ErrorBoundaryHoc(
  ({ isOpen, close, rule, expandedRowId }) => {
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      has_container: yup.bool().required(t('fieldShouldBeFilled')).nullable(),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      reset,
      handleSubmit,
      setError,
      setValue,
      watch,
      trigger,
    } = useForm({ resolver });
    const hasContainer = watch('has_container');

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(createContainerLimitation({ ...values, rule })).unwrap();
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
      if (isOpen) dispatch(fetchContractType());
    }, []);

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
            placeholder={t('byLoadingListContainer')}
            disabled
            lined
          />
          <div>
            <p className={inputStyle.labelText}>{t('containerRequired').toLowerCase()}:</p>
            <div className={s.inputs}>
              <div
                className={inputStyle.input}
                onClick={() => {
                  setValue('has_container', true);
                  trigger();
                }}
              >
                <Checkbox
                  checked={hasContainer === true}
                  size="big"
                  label={uppercase(t('yes'))}
                  labelStyle={{ color: '#232323' }}
                />
              </div>
              <div
                className={inputStyle.input}
                onClick={() => {
                  setValue('has_container', false);
                  trigger();
                }}
              >
                <Checkbox
                  checked={hasContainer === false}
                  size="big"
                  label={uppercase(t('no'))}
                  labelStyle={{ color: '#232323' }}
                />
              </div>
            </div>
            {errors.has_container && (
              <p className={inputStyle.error}>{errors.has_container.message}</p>
            )}
          </div>
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
          title={t('toCancelLimitationCreationByContainer')}
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
