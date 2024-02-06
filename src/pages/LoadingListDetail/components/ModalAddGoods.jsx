import s from '../index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  addAndRemoveActAcceptanceFromLoadingList,
  fetchContractType,
  fetchFilterDirectionList,
  fetchFilterGoodsType,
  fetchFilterStatusList,
  fetchFilterTagList,
  fetchGoodsToAddOrders,
  fetchGoodsToAddToLoadingList,
} from '@/store/actions';
import { ErrorBoundaryHoc, Modal, Table } from '@/components';
import { Row, TableFilter } from './index';

const HEAD_ROW = [
  'actNumber',
  'inventoryDate',
  'receiverCodeFilter',
  'contractType',
  'directionFilter',
  'seatsNumber',
  'weight',
  'volume',
  'sum',
  'tags',
  'status',
];

export const ModalAddGoods = ErrorBoundaryHoc(({ isOpen, close, fetchLoadingList }) => {
  const goods = useSelector(state => state.loadingList.goodsToAdd);
  const [checkedActs, setCheckedActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { loadingListId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const footerTags = useMemo(() => {
    if (!goods) return [];
    const { goods_acceptance_count, receiver_count, place_count, weight, volume, cost, currency } =
      goods.total;
    return [
      `${goods_acceptance_count} ${t(goods_acceptance_count === 1 ? 'act' : 'acts').toLowerCase()}`,
      `${receiver_count} ${t(receiver_count === 1 ? 'receiver' : 'receiverCount').toLowerCase()}`,
      `${place_count} ${t(place_count === 1 ? 'seat' : 'seats')}`,
      `${weight} ${t('weightKg')}`,
      `${volume} ${t('cubicMeter')}`,
      `${cost} ${currency.symbol}`,
    ];
  }, [goods]);

  const onAddGoods = async () => {
    setConfirmLoading(true);
    await dispatch(
      addAndRemoveActAcceptanceFromLoadingList({
        loadingListId,
        checkedActs,
        navigate,
        close,
        fetchLoadingList,
      })
    );
    setConfirmLoading(false);
  };
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchContractType());
      dispatch(fetchFilterStatusList());
      dispatch(fetchFilterTagList());
      dispatch(fetchFilterGoodsType());
      dispatch(fetchFilterDirectionList());
      dispatch(fetchGoodsToAddOrders());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      dispatch(fetchGoodsToAddToLoadingList({ id: loadingListId, searchParams })).finally(() =>
        setLoading(false)
      );
    }
  }, [searchParams, isOpen]);

  useEffect(() => {
    if (goods && isOpen) {
      setCheckedActs(goods.results.filter(({ is_added }) => !!is_added).map(({ id }) => id));
    }
  }, [goods, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      close={() => {
        setSearchParams({});
        close();
      }}
      contentStyle={{ padding: '3px 0 0 0', height: '100%', width: '100%', maxWidth: 1610 }}
      outsideCloseBtn
      overflow="visible"
    >
      <Table
        className={s.table}
        selectable
        checked={!!goods?.results.length && checkedActs.length === goods?.results.length}
        onSelect={() =>
          setCheckedActs(
            checkedActs.length === goods?.results.length ? [] : goods.results.map(({ id }) => id)
          )
        }
        loading={loading}
        maxHeight="none"
        height={window.innerHeight - 80}
        row={goods?.results}
        filter={<TableFilter />}
        headRow={HEAD_ROW}
        RowComponent={Row}
        rowProps={{ setCheckedActs, checkedActs }}
        footerTags={footerTags}
        emptyMessage="actsListEmpty"
        onFooterBtnClick={onAddGoods}
        footerBtnDisabled={confirmLoading}
      />
    </Modal>
  );
});
