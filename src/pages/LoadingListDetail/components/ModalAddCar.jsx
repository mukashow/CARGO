import s from '../index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addCarToLoadingList, fetchLoadingListInfo } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useYupValidationResolver } from '@/hooks';

export const ModalAddCar = ErrorBoundaryHoc(({ isOpen, close, hasContainer }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loadingListId } = useParams();
  const navigate = useNavigate();

  const numberSchema = yup.lazy(() => {
    const scheme = yup
      .number()
      .transform((_value, originalValue) =>
        originalValue ? Number(originalValue.replace(/,/g, '.')) : originalValue
      )
      .typeError(t('enterNumber'))
      .nullable();

    if (hasContainer) return scheme;
    return scheme.required(t('fieldShouldBeFilled'));
  });
  const validationSchema = yup.object({
    number: yup.string().required(t('fieldShouldBeFilled')),
    brand: yup.string().required(t('fieldShouldBeFilled')),
    driver: yup.string().required(t('fieldShouldBeFilled')),
    contact: yup.string().required(t('fieldShouldBeFilled')),
    max_weight: numberSchema,
    max_volume: numberSchema,
  });
  const resolver = useYupValidationResolver(validationSchema);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      number: '',
      brand: '',
      driver: '',
      contact: '',
      max_weight: null,
      max_volume: null,
    },
    resolver,
  });

  const onSubmit = values => {
    setLoading(true);
    dispatch(addCarToLoadingList({ loadingList: loadingListId, ...values }))
      .then(() => {
        dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }));
        reset();
        close();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal isOpen={isOpen} close={() => setConfirmOpen(true)} title={t('car')}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={s.inputs}>
          <Input
            register={register}
            name="number"
            labelText={t('carNumber') + ':'}
            placeholder={t('modalCreateClientPlaceholder')}
            errors={errors.number?.message}
          />
          <Input
            register={register}
            name="brand"
            labelText={t('carBrand') + ':'}
            placeholder={t('modalCreateClientPlaceholder')}
            errors={errors.brand?.message}
          />
          <Input
            register={register}
            name="driver"
            labelText={t('carDriver') + ':'}
            placeholder={t('modalCreateClientPlaceholder')}
            errors={errors.driver?.message}
          />
          <Input
            register={register}
            name="contact"
            labelText={t('driverContacts') + ':'}
            placeholder={t('modalCreateClientPlaceholder')}
            errors={errors.contact?.message}
          />
          {!hasContainer && (
            <>
              <Input
                register={register}
                name="max_weight"
                labelText={t('permissibleWeight').toLowerCase() + ':'}
                placeholder={t('modalCreateClientPlaceholder')}
                errors={errors.max_weight?.message}
              />
              <Input
                register={register}
                name="max_volume"
                labelText={t('permissibleVolume').toLowerCase() + ':'}
                placeholder={t('modalCreateClientPlaceholder')}
                errors={errors.max_volume?.message}
              />
            </>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: window.innerWidth > 1440 ? 40 : 24,
          }}
        >
          <Button type="button" isBlue value={t('add')} disabled={loading} />
        </div>
      </form>
      <ModalAction
        title={t('toCancelCarCreation')}
        description={t('toCancelCarCreationDescription')}
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
