import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createSeal, fetchLoadingListInfo } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useYupValidationResolver } from '@/hooks';

export const ModalAddSeal = ErrorBoundaryHoc(({ isOpen, close }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loadingListId } = useParams();
  const navigate = useNavigate();

  const validationSchema = yup.object({
    number: yup
      .string()
      .required(t('fieldShouldBeFilled'))
      .max(20, `${t('maxCharactersLength')} 20`),
  });
  const resolver = useYupValidationResolver(validationSchema);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { seal: '' }, resolver });

  const onSubmit = ({ number }) => {
    setLoading(false);
    dispatch(createSeal({ loadingListId, number }))
      .unwrap()
      .then(() => {
        dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }));
        reset();
        close();
      })
      .catch(errors => {
        setError('number', { message: errors.number });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal isOpen={isOpen} close={() => setConfirmOpen(true)} title={t('seal')} overflow="visible">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          labelText={t('seal').toLowerCase() + ':'}
          placeholder={t('modalCreateClientPlaceholder')}
          register={register}
          name="number"
          errors={errors.number?.message}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: window.innerWidth > 1440 ? 40 : 24,
          }}
        >
          <Button type="button" isBlue value={t('add')} disabled={loading} />
        </div>
      </form>
      <ModalAction
        title={t('toCancelSealCreation')}
        description={t('toCancelSealCreationDescription')}
        isOpen={confirmOpen}
        onSubmit={() => {
          setConfirmOpen(false);
          reset();
          close();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Modal>
  );
});
