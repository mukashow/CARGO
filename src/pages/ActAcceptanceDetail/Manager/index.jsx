import s from '../index.module.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  confirmGoodsAcceptance,
  fetchDocumentDocuments,
  fetchFilesType,
  fetchGoodsTypeWithTnved,
  fetchManagerGoodsAcceptanceInfo,
  finishActAcceptance,
  setExpenseInjectMode,
  setGoodsDetail,
} from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Header, Loader, ModalAction } from '@/components';
import { useConfirmNavigate } from '@/hooks';
import { Actions, Cards, Tabs } from './components';

export const ManagerActAcceptanceDetail = ErrorBoundaryHoc(() => {
  const goodsDetail = useSelector(state => state.goods.goodsDetail);
  const { hasStorekeeperPermissions, roleId } = useSelector(state => ({
    hasStorekeeperPermissions: state.auth.user.has_storekeeper_permissions,
    roleId: state.auth.user.role_id,
  }));
  const expenses = useSelector(state => state.documents.expenses?.extra_cost_list);
  const expenseInjectingMode = expenses?.some(({ createMode }) => createMode)
    ? 'create'
    : expenses?.some(({ editMode }) => editMode)
    ? 'edit'
    : null;
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [confirmFinishModal, setConfirmFinishModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalData = useRef({});
  const dispatch = useDispatch();
  const { actId } = useParams();
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tabConfirmFn = useRef(() => {});
  const [backModalOpen, backConfirm, cancelBack] = useConfirmNavigate(!!expenseInjectingMode);

  const isEnterInventoryBtnActive = useMemo(() => {
    if (!goodsDetail) return false;
    return (
      (goodsDetail.status_id === 1 || goodsDetail.status_id === 2) &&
      !goodsDetail.is_acceptance_finished &&
      hasStorekeeperPermissions
    );
  }, [goodsDetail]);

  const onConfirmActAcceptance = () => {
    setConfirmLoading(true);
    dispatch(confirmGoodsAcceptance(goodsDetail.id))
      .unwrap()
      .then(() => {
        dispatch(fetchManagerGoodsAcceptanceInfo({ id: actId }));
        setIsInventoryMode(false);
      })
      .finally(() => {
        setConfirmModal(false);
        setConfirmLoading(false);
      });
  };

  const onConfirmFinishAct = () => {
    setConfirmLoading(true);
    dispatch(finishActAcceptance({ id: actId }))
      .unwrap()
      .then(() => setIsInventoryMode(false))
      .finally(() => {
        setConfirmFinishModal(false);
        setConfirmLoading(false);
      });
  };

  const onModalOpen = (cb, title, description) => {
    modalData.current.cb = cb;
    modalData.current.title = title;
    modalData.current.description = description;
    setConfirmModal(true);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchManagerGoodsAcceptanceInfo({ id: actId, navigate })).finally(() =>
      setLoading(false)
    );
  }, [actId]);

  useEffect(() => {
    if (hasStorekeeperPermissions) dispatch(fetchGoodsTypeWithTnved());
    const onBackButton = () => {
      if (state?.path) navigate(state.path);
      window.removeEventListener('popstate', onBackButton);
    };
    window.addEventListener('popstate', onBackButton);

    return () => {
      dispatch(setGoodsDetail(null));
    };
  }, []);

  useEffect(() => {
    if (isEnterInventoryBtnActive) {
      setIsInventoryMode(goodsDetail.is_acceptance_started);
    }
  }, [isEnterInventoryBtnActive]);

  useEffect(() => {
    dispatch(fetchDocumentDocuments(actId));
    dispatch(fetchFilesType());
  }, [pathname]);

  return (
    <>
      <Header
        onClick={
          roleId === 1 && goodsDetail?.status_id === 2
            ? () => onModalOpen(onConfirmActAcceptance, 'toConfirmActAcceptance', null)
            : null
        }
        submitButtonValue="modalConfirmLabelConfirm"
        onAdditionalClick={
          isEnterInventoryBtnActive
            ? !isInventoryMode && !goodsDetail.is_acceptance_started
              ? () => setIsInventoryMode(true)
              : goodsDetail?.is_acceptance_started
              ? () => setConfirmFinishModal(true)
              : null
            : null
        }
        additionalSubmitButtonProps={{
          isOrange:
            !isInventoryMode && isEnterInventoryBtnActive && !goodsDetail.is_acceptance_started,
        }}
        additionalSubmitButtonValue={t(
          !isInventoryMode && isEnterInventoryBtnActive && !goodsDetail.is_acceptance_started
            ? 'enterInventory'
            : 'completeInventory'
        )}
        title={`${t('acceptanceReport')} #${actId}`}
        status={goodsDetail?.status_name}
        statusId={goodsDetail?.status_id}
        statusType="goodsAcceptance"
        statusAuthor={`${goodsDetail?.creator_name} ${goodsDetail?.creator_last_name}`}
        statusDate={goodsDetail?.created_at.slice(0, 10)}
      />
      <ModalAction
        isOpen={confirmModal}
        submitButtonDisabled={confirmLoading}
        onSubmit={modalData.current?.cb}
        onCancel={() => setConfirmModal(false)}
        title={t(modalData.current?.title)}
        description={t(modalData.current?.description)}
      />
      <ModalAction
        isOpen={confirmFinishModal}
        submitButtonDisabled={confirmLoading}
        title={t('toCompleteInventory')}
        description={t('toCompleteInventoryDescription')}
        onCancel={() => setConfirmFinishModal(false)}
        onSubmit={onConfirmFinishAct}
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
      <Box style={window.innerWidth > 1440 ? { padding: '40px 24px 24px' } : { padding: 24 }}>
        {loading ? (
          <Loader />
        ) : (
          goodsDetail && (
            <>
              <div className={s.top}>
                <Cards />
                <Actions
                  setConfirmModal={setConfirmModal}
                  onModalOpen={onModalOpen}
                  setConfirmLoading={setConfirmLoading}
                  expenseInjectingMode={expenseInjectingMode}
                  setCancelConfirmModal={setCancelConfirmModal}
                  tabConfirmFn={tabConfirmFn}
                />
              </div>
              <Tabs
                isInventoryMode={isInventoryMode}
                setCancelConfirmModal={setCancelConfirmModal}
                expenseInjectingMode={expenseInjectingMode}
                tabConfirmFn={tabConfirmFn}
              />
            </>
          )
        )}
      </Box>
    </>
  );
});
