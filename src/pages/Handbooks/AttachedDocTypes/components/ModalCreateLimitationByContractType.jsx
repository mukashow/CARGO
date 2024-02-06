import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createContractTypeLimitation,
  fetchContractType,
  fetchDocTypeRule,
  fetchDocTypes,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateLimitationByContractType = ErrorBoundaryHoc(
  ({ isOpen, close, rule, expandedRowId }) => {
    const contractType = useSelector(state => state.documents.contractType);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      contract_type: yup.object().required(t('fieldShouldBeFilled')).nullable(),
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
        await dispatch(createContractTypeLimitation({ ...values, rule })).unwrap();
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
            placeholder={t('byContractType')}
            disabled
            lined
          />
          <SelectCustom
            options={contractType || []}
            getOptionLabel={option => option.name}
            getOptionValue={option => option.id}
            name="contract_type"
            labelText={t('contractType')}
            error={errors.contract_type?.message}
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
          title={t('toCancelLimitationCreationByContractType')}
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
