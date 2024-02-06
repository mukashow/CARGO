import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, ModalAction, Loader, ModalCreateDocument } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  ModalAddGoods,
  ModalRevision,
  Header,
  Tabs,
  Top,
  ModalConfiscateCargo,
} from './components';
import {
  changeLoadingListStatus,
  fetchFilesType,
  fetchGoodsForUnloading,
  fetchLoadingListConfirmStatuses,
  fetchDocumentDocuments,
  fetchDocumentExpenses,
  fetchLoadingListInfo,
  fetchScannedPlaces,
  setExpenseInjectMode,
} from '@/store/actions';
import { useConfirmNavigate } from '@/hooks';

export const LoadingListDetail = ErrorBoundaryHoc(() => {
  const loadingList = useSelector(state => state.loadingList.loadingListDetail);
  const { roleId, hasStorekeeperPermission } = useSelector(state => ({
    roleId: state.auth.user.role_id,
    hasStorekeeperPermission: state.auth.user.has_storekeeper_permissions,
  }));
  const expenses = useSelector(state => state.documents.expenses?.extra_cost_list);
  const [addGoodsModal, setAddGoodsModal] = useState(false);
  const [returnForRevisionModal, setReturnForRevisionModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [canReturnForRevision, setCanReturnForRevision] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createDocumentModal, setCreateDocumentModal] = useState(false);
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);
  const [confiscateCargoModal, setConfiscatedCargoModal] = useState(false);
  const dispatch = useDispatch();
  const { loadingListId } = useParams();
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const expenseInjectingMode = expenses?.some(({ createMode }) => createMode)
    ? 'create'
    : expenses?.some(({ editMode }) => editMode)
    ? 'edit'
    : null;
  const [backModalOpen, backConfirm, cancelBack] = useConfirmNavigate(!!expenseInjectingMode);
  const { t } = useTranslation();
  const tabConfirmFn = useRef(() => {});
  const fetchPlaces = useRef(() => {});

  const fetchLoadingList = () => {
    setLoading(true);
    dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }))
      .unwrap()
      .then(data => {
        if (data.status === 7 && (roleId === 2 || hasStorekeeperPermission)) {
          dispatch(fetchScannedPlaces(loadingListId));
        }
        if (
          data.status === 12 &&
          (roleId === 2 || hasStorekeeperPermission) &&
          data.can_unload_places
        ) {
          dispatch(fetchGoodsForUnloading(loadingListId));
        }
      });
    dispatch(fetchLoadingListConfirmStatuses({ id: loadingListId }))
      .unwrap()
      .then(statuses => {
        setAvailableStatuses({
          isWaitingForManagerConfirm: statuses.some(({ id }) => id === 2),
          isWaitingForBrokerConfirm: statuses.some(({ id }) => id === 3),
          awaitingPermissionToLoad: statuses.some(({ id }) => id === 5),
          waitingToLoad: statuses.some(({ id }) => id === 6),
          onLoading: statuses.some(({ id }) => id === 7),
          waitingToSend: statuses.some(({ id }) => id === 8),
          onWay: statuses.some(({ id }) => id === 9),
          confirmArrival: statuses.some(({ id }) => id === 10),
          confirmArrivalToWarehouse: statuses.some(({ id }) => id === 11),
          onUnloading: statuses.some(({ id }) => id === 12),
          finished: statuses.some(({ id }) => id === 14),
        });
        setCanReturnForRevision(statuses.some(({ id }) => id === 4));
      })
      .finally(() => setLoading(false));
    dispatch(fetchDocumentDocuments(loadingListId));
    dispatch(fetchFilesType());
    if (String(roleId).match(/1|3|4|5/)) {
      dispatch(fetchDocumentExpenses(loadingListId));
    }
  };

  const onSubmit = async () => {
    setConfirmLoading(true);
    await dispatch(changeLoadingListStatus({ id: loadingListId }));
    setConfirmLoading(false);
    setConfirmModal({ ...confirmModal, isOpen: false });
    if (roleId === 2 && availableStatuses?.finished) {
      return navigate('/loading_tasks?tab=unloading_tasks&page=1&page_size=25');
    }
    fetchLoadingList();
  };

  useEffect(() => {
    fetchLoadingList();
    const onBackButton = () => {
      if (state?.path) navigate(state.path);
      window.removeEventListener('popstate', onBackButton);
    };
    window.addEventListener('popstate', onBackButton);
  }, [pathname]);

  return (
    <>
      <Header
        availableStatuses={availableStatuses}
        canReturnForRevision={canReturnForRevision}
        setReturnForRevisionModal={setReturnForRevisionModal}
        setConfirmModal={setConfirmModal}
        setConfiscatedCargoModal={setConfiscatedCargoModal}
      />
      <Box style={window.innerWidth > 1440 ? { padding: '40px 24px 24px' } : { padding: 24 }}>
        {loading ? (
          <Loader />
        ) : (
          loadingList && (
            <>
              <Top
                isExpenseInjecting={!!expenseInjectingMode}
                setCancelConfirmModal={setCancelConfirmModal}
                tabConfirmFn={tabConfirmFn}
              />
              <Tabs
                setCancelConfirmModal={setCancelConfirmModal}
                expenseInjectingMode={expenseInjectingMode}
                tabConfirmFn={tabConfirmFn}
                setAddGoodsModal={setAddGoodsModal}
                setCreateDocumentModal={setCreateDocumentModal}
                fetchPlaces={fetchPlaces}
              />
            </>
          )
        )}
        <ModalCreateDocument
          type="document"
          clientId={loadingListId}
          isOpen={createDocumentModal}
          close={() => setCreateDocumentModal(false)}
        />
        <ModalAction
          isOpen={cancelConfirmModal || backModalOpen}
          onCancel={() => {
            setCancelConfirmModal(false);
            cancelBack();
            tabConfirmFn.current = () => {};
          }}
          onSubmit={() => {
            setCancelConfirmModal(false);
            dispatch(setExpenseInjectMode({ type: 'cancel' }));
            backConfirm();
            tabConfirmFn.current();
          }}
          title={t(
            expenseInjectingMode === 'create' ? 'toCancelCreatingExpense' : 'toCancelEditingExpense'
          )}
        />
      </Box>
      <ModalAction
        title={confirmModal?.title}
        description={confirmModal?.description}
        isOpen={confirmModal?.isOpen}
        onSubmit={onSubmit}
        submitButtonDisabled={confirmLoading}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
      {(roleId === 1 || roleId === 5) && (
        <ModalAddGoods
          isOpen={addGoodsModal}
          close={() => setAddGoodsModal(false)}
          fetchLoadingList={fetchLoadingList}
        />
      )}
      <ModalRevision
        isOpen={returnForRevisionModal}
        close={() => setReturnForRevisionModal(false)}
        fetchLoadingList={fetchLoadingList}
      />
      <ModalConfiscateCargo
        isOpen={confiscateCargoModal}
        close={() => setConfiscatedCargoModal(false)}
      />
    </>
  );
});
