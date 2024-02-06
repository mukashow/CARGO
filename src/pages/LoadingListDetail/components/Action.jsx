import React, { useEffect, useRef, useState } from 'react';
import s from '../index.module.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ActionInDetail, Dropdown, ModalAction } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  deleteLoadingList,
  deleteSeal,
  fetchCanUpdateLoadingList,
  fetchLoadingListInfo,
  removeCarFromLoadingList,
  removeContainerFromLoadingList,
} from '@/store/actions';
import { ModalAddContainer } from '@pages/LoadingListDetail/components/ModalAddContainer';
import { ModalAddCar } from '@pages/LoadingListDetail/components/ModalAddCar';
import { ModalAddSeal } from '@pages/LoadingListDetail/components/ModalAddSeal';

export const Action = ErrorBoundaryHoc(
  ({
    car,
    container,
    canDelete,
    can_add_car,
    can_add_container,
    can_delete_seal,
    can_add_seal,
    sealId,
    onEdit,
  }) => {
    const roleId = useSelector(state => state.auth.user.role_id);
    const [dropdownOpen, setDropdownOpen] = useState({
      delete: false,
      create: false,
    });
    const [createModalOpen, setCreateModalOpen] = useState({
      auto: false,
      container: false,
      seal: false,
    });
    const [confirmModal, setConfirmModal] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [canUpdate, setCanUpdate] = useState(true);
    const { loadingListId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const confirmData = useRef({});

    useEffect(() => {
      dispatch(fetchCanUpdateLoadingList(loadingListId))
        .unwrap()
        .then(({ can_update }) => setCanUpdate(can_update));
    }, []);

    return (
      <div>
        <ActionInDetail
          onEdit={() =>
            onEdit
              ? onEdit(() => navigate(`/loading_list/${loadingListId}/edit`))
              : navigate(`/loading_list/${loadingListId}/edit`)
          }
          editDisabled={!canUpdate}
          onDelete={() => setDropdownOpen({ ...dropdownOpen, delete: true })}
        >
          {dropdownOpen.delete && (
            <Dropdown
              className={s.deleteDropdown}
              isOpen
              close={() => setDropdownOpen({ ...dropdownOpen, delete: false })}
              open={() => setDropdownOpen({ ...dropdownOpen, delete: true })}
              iconColor="#DF3B57"
              iconId="trash"
              buttonTitle="delete"
              list={[
                {
                  disabled: !canDelete,
                  title: t('loadingList'),
                  onClick: () => {
                    setConfirmModal(true);
                    confirmData.current = {
                      onSubmit: () => {
                        setConfirmLoading(true);
                        dispatch(deleteLoadingList(loadingListId))
                          .unwrap()
                          .then(() => navigate(state?.path || -1))
                          .finally(() => {
                            setConfirmLoading(false);
                            setConfirmModal(false);
                          });
                      },
                      title: t('toDeleteLoadingList'),
                      description: t('toDeleteLoadingListDescription'),
                    };
                  },
                },
                {
                  title: t('car'),
                  disabled: !car || !car.can_delete_car,
                  onClick: () => {
                    setConfirmModal(true);
                    confirmData.current = {
                      onSubmit: () => {
                        setConfirmLoading(true);
                        dispatch(removeCarFromLoadingList({ id: loadingListId, carId: car.id }))
                          .then(() => {
                            dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }));
                          })
                          .finally(() => {
                            setConfirmModal(false);
                            setConfirmLoading(false);
                          });
                      },
                      title: t('toDeleteCar'),
                      description: t('toDeleteCarDescription'),
                    };
                  },
                },
                {
                  title: t('container'),
                  disabled: !container || !container?.can_delete_container,
                  onClick: () => {
                    setConfirmModal(true);
                    confirmData.current = {
                      onSubmit: () => {
                        setConfirmLoading(true);
                        dispatch(removeContainerFromLoadingList(loadingListId))
                          .then(() => {
                            dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }));
                          })
                          .finally(() => {
                            setConfirmLoading(false);
                            setConfirmModal(false);
                          });
                      },
                      title: t('toDeleteContainer'),
                    };
                  },
                },
                {
                  title: t('aSeal'),
                  disabled: !String(roleId).match(/1|4|5/) || !can_delete_seal,
                  onClick: () => {
                    setConfirmModal(true);
                    confirmData.current = {
                      onSubmit: () => {
                        setConfirmLoading(true);
                        dispatch(deleteSeal({ loadingListId, sealId }))
                          .then(() => {
                            dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }));
                          })
                          .finally(() => {
                            setConfirmLoading(false);
                            setConfirmModal(false);
                          });
                      },
                      title: t('toDeleteSeal'),
                      description: t('toDeleteSealDescription'),
                    };
                  },
                },
              ]}
            />
          )}
        </ActionInDetail>
        <Dropdown
          isOpen={dropdownOpen.create}
          close={() => setDropdownOpen({ ...dropdownOpen, create: false })}
          open={() => setDropdownOpen({ ...dropdownOpen, create: true })}
          iconColor="#0B6BE6"
          iconId="plusCircle"
          buttonTitle="add"
          lightBlue
          list={[
            {
              title: t('car'),
              disabled: !can_add_car,
              onClick: () => setCreateModalOpen({ ...createModalOpen, auto: true }),
            },
            {
              title: t('container'),
              disabled: !can_add_container || roleId === 4,
              onClick: () => setCreateModalOpen({ ...createModalOpen, container: true }),
            },
            {
              title: t('aSeal'),
              disabled: !String(roleId).match(/1|4|5/) || !can_add_seal,
              onClick: () => setCreateModalOpen({ ...createModalOpen, seal: true }),
            },
          ]}
        />
        <ModalAction
          isOpen={confirmModal}
          onSubmit={confirmData.current.onSubmit}
          onCancel={() => setConfirmModal(false)}
          title={confirmData.current.title}
          description={confirmData.current.description}
          submitButtonDisabled={confirmLoading}
        />
        <ModalAddContainer
          isOpen={createModalOpen.container}
          close={() => setCreateModalOpen({ ...createModalOpen, container: false })}
        />
        <ModalAddCar
          isOpen={createModalOpen.auto}
          close={() => setCreateModalOpen({ ...createModalOpen, auto: false })}
          hasContainer={!!container}
        />
        <ModalAddSeal
          isOpen={createModalOpen.seal}
          close={() => setCreateModalOpen({ ...createModalOpen, seal: false })}
        />
      </div>
    );
  }
);
