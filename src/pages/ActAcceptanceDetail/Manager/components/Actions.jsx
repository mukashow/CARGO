import s from '../../index.module.scss';
import actionStyle from '@components/ActionInDetail/index.module.scss';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalPaymentInvoiceCreate } from '@components/Modal/PaymentInvoice/Create';
import { ActionInDetail, Button } from '@/components';
import {
  deleteGoodsAcceptance,
  fetchManagerGoodsAcceptanceInfo,
  goodsAcceptanceRefreshTariff,
  updateGoodsAcceptanceAct,
} from '@actions/goods';
import { useOutsideClick } from '@hooks';

export const Actions = ErrorBoundaryHoc(
  ({
    onModalOpen,
    setConfirmModal,
    setConfirmLoading,
    expenseInjectingMode,
    setCancelConfirmModal,
    tabConfirmFn,
  }) => {
    const goodsDetail = useSelector(state => state.goods.goodsDetail);
    const role = useSelector(state => state.auth.user.role_id);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [createInvoiceModal, setCreateInvoiceModal] = useState(false);
    const dispatch = useDispatch();
    const { actId } = useParams();
    const { state } = useLocation();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dropdownRef = useRef();
    useOutsideClick(dropdownRef, () => setDropdownOpen(null));

    const onDeleteActAcceptance = () => {
      setConfirmLoading(true);
      dispatch(deleteGoodsAcceptance(goodsDetail.id))
        .unwrap()
        .then(() => navigate(state?.path || -1))
        .finally(() => {
          setConfirmModal(false);
          setConfirmLoading(false);
        });
    };

    const updateRates = useCallback(() => {
      if (goodsDetail?.status_id === 7) return;

      const onUpdateRates = () => {
        setConfirmLoading(true);
        dispatch(goodsAcceptanceRefreshTariff(goodsDetail.id))
          .unwrap()
          .then(() => dispatch(fetchManagerGoodsAcceptanceInfo({ id: actId })))
          .finally(() => {
            setConfirmModal(false);
            setConfirmLoading(false);
          });
      };

      if (!!expenseInjectingMode) {
        setCancelConfirmModal(true);
        tabConfirmFn.current = () => {
          onModalOpen(onUpdateRates, 'toUpdateRates', 'toUpdateRatesDescription');
        };
        return;
      }

      onModalOpen(onUpdateRates, 'toUpdateRates', 'toUpdateRatesDescription');
    }, [expenseInjectingMode, goodsDetail, actId]);

    const edit = useCallback(() => {
      if (!!expenseInjectingMode) {
        setCancelConfirmModal(true);
        tabConfirmFn.current = () => navigate(`/goods_act_acceptance/${actId}/edit`);
        return;
      }

      navigate(`/goods_act_acceptance/${actId}/edit`);
    }, [expenseInjectingMode, actId]);

    const onUnitsChange = e => {
      const unit = e.target.dataset.unit;
      dispatch(
        updateGoodsAcceptanceAct({ actId, unit_of_measure: unit === 'null' ? null : unit })
      ).then(() => dispatch(fetchManagerGoodsAcceptanceInfo({ id: actId, navigate })));
    };

    return (
      <ActionInDetail
        onDelete={() =>
          onModalOpen(
            onDeleteActAcceptance,
            'toDeleteActAcceptance',
            'toDeleteActAcceptanceDescription'
          )
        }
        deleteDisabled={!!goodsDetail?.total_of_goods.length}
        onEdit={edit}
        editDisabled={goodsDetail?.status_id === 7}
        style={{ minWidth: 180 }}
      >
        {(role === 1 || role === 5) && (
          <div className={s.actionWrap} ref={dropdownRef}>
            <Button
              value={t('tariffs')}
              isSmall
              isBlue
              style={{ fontWeight: 400 }}
              onClick={() => setDropdownOpen('rates')}
            />
            {dropdownOpen === 'rates' && (
              <div className={s.dropdown}>
                <Button
                  value={t('updateTariff')}
                  isSmall
                  className={actionStyle.button}
                  onClick={updateRates}
                />
                <p className={s.dropdownTitle}>Переключить тарифы</p>
                <Button
                  value={t('cubicMeter')}
                  style={{ marginBottom: 10 }}
                  tiny
                  green={goodsDetail?.unit_of_measure?.name === 'm3'}
                  onClick={onUnitsChange}
                  data-unit="m3"
                />
                <Button
                  value={t('weightKg')}
                  style={{ marginBottom: 10 }}
                  tiny
                  green={goodsDetail?.unit_of_measure?.name === 'kg'}
                  onClick={onUnitsChange}
                  data-unit="kg"
                />
                <Button
                  value={t('all').toLowerCase()}
                  tiny
                  green={goodsDetail?.unit_of_measure === null}
                  onClick={onUnitsChange}
                  data-unit="null"
                />
              </div>
            )}
          </div>
        )}
        <div className={s.createList}>
          <p className={s.title}>{t('sidebarCreate')}:</p>
          <div className={s.option} onClick={() => setCreateInvoiceModal(true)}>
            {t('paymentInvoice')}
          </div>
        </div>
        <ModalPaymentInvoiceCreate
          close={() => setCreateInvoiceModal(false)}
          isOpen={createInvoiceModal}
        />
      </ActionInDetail>
    );
  }
);
