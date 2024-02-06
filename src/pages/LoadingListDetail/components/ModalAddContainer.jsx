import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addContainerToLoadingList,
  fetchContainersList,
  fetchLoadingListInfo,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Modal, ModalAction, SelectCustom } from '@/components';
import { useYupValidationResolver } from '@/hooks';

export const ModalAddContainer = ErrorBoundaryHoc(({ isOpen, close }) => {
  const containers = useSelector(state => state.warehouse.containersList);
  const loadingList = useSelector(state => state.loadingList.loadingListDetail);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loadingListId } = useParams();
  const navigate = useNavigate();

  const validationSchema = yup.object({
    container: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .default(undefined)
      .required(t('fieldShouldBeFilled'))
      .nullable(),
  });
  const resolver = useYupValidationResolver(validationSchema);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { container: null }, resolver });

  const onSubmit = ({ container: { value } }) => {
    setLoading(false);
    dispatch(addContainerToLoadingList({ loadingList: loadingListId, container: value }))
      .then(() => {
        dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }));
        reset();
        close();
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (loadingList && isOpen) {
      dispatch(fetchContainersList(loadingList.warehouse));
    }
  }, [loadingList, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      close={() => setConfirmOpen(true)}
      title={t('container')}
      overflow="visible"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectCustom
          labelText={t('containerNumber') + ':'}
          placeholder={t('selectContainerRequired')}
          style={{ marginBottom: window.innerWidth > 1440 ? 40 : 24 }}
          options={containers}
          control={control}
          name="container"
          error={errors.container?.message}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="button" isBlue value={t('add')} disabled={loading} />
        </div>
      </form>
      <ModalAction
        title={t('toCancelContainerCreation')}
        description={t('toCancelContainerCreationDescription')}
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
