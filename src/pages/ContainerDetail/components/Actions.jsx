import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionInDetail, ModalAction, ModalCreateUpdateContainer } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { deleteContainer, fetchContainerDocuments, fetchContainerOne } from '@actions';

export const Actions = ErrorBoundaryHoc(() => {
  const container = useSelector(state => state.container.containerOne);
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { containerId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <ActionInDetail
        onDelete={() => setDeleteModal(true)}
        onEdit={() => setUpdateModal(true)}
        editDisabled={!container?.can_update}
      />
      <ModalCreateUpdateContainer
        isOpen={updateModal}
        close={() => setUpdateModal(false)}
        mode="edit"
        callback={() => {
          dispatch(fetchContainerOne(containerId));
          dispatch(fetchContainerDocuments(containerId));
        }}
        containerId={containerId}
      />
      <ModalAction
        isOpen={deleteModal}
        onCancel={() => setDeleteModal(false)}
        title={t('deleteContainer')}
        description={t('deleteContainerDescription')}
        onSubmit={() =>
          dispatch(deleteContainer(containerId))
            .unwrap()
            .then(() => {
              navigate(-1);
            })
        }
      />
    </>
  );
});
