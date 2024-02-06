import mainStyle from '../../index.module.scss';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { declOfNum } from '@/helpers';
import { ErrorBoundaryHoc, Modal, Table } from '@components';
import { addOrDeleteGoodsOfBill, clearPlaces } from '@actions';
import { GoodsModalRow, ModalPlaces } from './index';

const HEAD_ROW = [
  'actNumber',
  'inventoryDate',
  'receiverCodeFilter',
  'clientContractType',
  'directionFilter',
  'seatsNumber',
  'weight',
  'volume',
  'sum',
  'tags',
  'status',
  'tableDocAction',
];

export const GoodsModal = ErrorBoundaryHoc(({ isOpen, close, goodsFetching }) => {
  const goods = useSelector(state => state.bill.goodsToAdd);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [confirmInProgress, setConfirmInProgress] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams();

  const footerTags = useMemo(() => {
    if (!goods) return [];
    const { goods_acceptance_count, cost, currency, place_count, volume, weight } = goods.total;
    const synopsis = ['акт', 'акта', 'актов'];
    return [
      `${
        i18n.language.match(/ru|ru-RU/)
          ? `${goods_acceptance_count} ${declOfNum(goods_acceptance_count, synopsis)}`
          : `${goods_acceptance_count} ${t('acts')}`
      }`,
      `${place_count} ${t('seats')}`,
      `${weight} ${t('weightKg')}`,
      `${volume} ${t('cubicMeter')}`,
      `${cost} ${currency?.symbol}`,
    ];
  }, [goods]);

  const onConfirm = () => {
    setConfirmInProgress(true);
    dispatch(addOrDeleteGoodsOfBill({ billId: id }))
      .unwrap()
      .then(() => {
        close();
      })
      .finally(() => setConfirmInProgress(false));
  };

  return (
    <Modal
      contentStyle={{ padding: 0, width: '100%', maxWidth: 1610, display: 'flex' }}
      overflow="unset"
      isOpen={isOpen}
      close={close}
      outsideCloseBtn
      onAfterClose={() => dispatch(clearPlaces())}
    >
      <Table
        headRow={HEAD_ROW}
        RowComponent={GoodsModalRow}
        row={goods?.goods_acceptance_list}
        rowProps={{ setPlaceModalOpen, setPlacesLoading }}
        rootTableStyle={{ borderRadius: 4, overflow: 'hidden' }}
        className={mainStyle.billGoodsTable}
        loading={goodsFetching}
        footerTags={footerTags}
        footerShadow
        footerBtnValue={t('modalConfirmLabelConfirm')}
        footerBtnDisabled={confirmInProgress}
        onFooterBtnClick={onConfirm}
      />
      <ModalPlaces
        isOpen={placeModalOpen}
        close={() => setPlaceModalOpen(false)}
        loading={placesLoading}
      />
    </Modal>
  );
});
