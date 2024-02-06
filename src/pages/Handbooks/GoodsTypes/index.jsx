import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Box, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  TableFilter,
  ModalCreateEditGoodsType,
  ModalCreateUpdateTnVedCode,
  Row,
} from './components';
import {
  deleteGoodsType,
  deleteTnved,
  fetchFilterGoodsType,
  fetchGoodsType,
  fetchLoadingListGoodsType,
} from '@/store/actions';

const HEAD_ROW = [
  'goodsTypeFilter',
  'inChinese',
  'inRussian',
  'inEnglish',
  'codeLetter',
  'tnvedCodeCount',
  '',
  'tableDocAction',
];

export const GoodsTypes = ErrorBoundaryHoc(({ setHeadRow, setFieldLabel }) => {
  const goodsTypes = useSelector(state => state.goods.goodsTypes);
  const [updateGoodsTypeModal, setUpdateGoodsTypeModal] = useState(false);
  const [deleteGoodsTypeModal, setDeleteGoodsTypeModal] = useState(false);
  const [createTnVedCodeModal, setCreateTnVedCodeModal] = useState(false);
  const [updateTnVedCodeModal, setUpdateTnVedCodeModal] = useState(false);
  const [deleteTnVedCodeModal, setDeleteTnVedCodeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(null);
  const [expandedCargo, setExpandedCargo] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const goodsType = useRef(null);
  const tnved = useRef(null);

  const onGoodsTypeDelete = () => {
    setConfirmLoading(true);
    dispatch(deleteGoodsType({ id: goodsType.current.id, searchParams, expandedCargo }))
      .then(() => {
        dispatch(fetchFilterGoodsType());
        dispatch(fetchLoadingListGoodsType());
      })
      .finally(() => {
        setDeleteGoodsTypeModal(false);
        setConfirmLoading(false);
      });
  };

  const onTnVedCodeDelete = () => {
    setConfirmLoading(true);
    dispatch(
      deleteTnved({
        id: tnved.current.id,
        searchParams,
        goodsTypeId: tnved.current.goods_type.id,
        expandedCargo,
      })
    ).finally(() => {
      setDeleteTnVedCodeModal(false);
      setConfirmLoading(false);
    });
  };

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(fetchGoodsType(searchParams));
      setLoading(false);
    })();
  }, [searchParams]);

  return (
    <Box>
      <Table
        filter={<TableFilter setFieldLabel={setFieldLabel} expandedCargo={expandedCargo} />}
        tableStyle={{ minWidth: 'auto' }}
        row={goodsTypes?.results}
        RowComponent={Row}
        currentPage={goodsTypes?.page.current_page}
        resultsCount={goodsTypes?.page.results_count}
        footerTags={[`${goodsTypes?.total.goods_type_count} ${t('goodsTypes').toLowerCase()}`]}
        rowProps={{
          setHeadRow,
          goodsType,
          tnved,
          setUpdateGoodsTypeModal,
          setDeleteGoodsTypeModal,
          setCreateTnVedCodeModal,
          setUpdateTnVedCodeModal,
          setDeleteTnVedCodeModal,
          setExpandedCargo,
        }}
        loading={loading}
        headRow={
          window.innerWidth > 1440 ? setHeadRow(HEAD_ROW) : setHeadRow(HEAD_ROW.filter(th => !!th))
        }
        emptyMessage={t('goodsTypesEmpty')}
      />
      <ModalCreateEditGoodsType
        expandedCargo={expandedCargo}
        mode="edit"
        isOpen={updateGoodsTypeModal}
        close={() => setUpdateGoodsTypeModal(false)}
        goodsType={goodsType.current}
        setFieldLabel={setFieldLabel}
      />
      <ModalCreateUpdateTnVedCode
        expandedCargo={expandedCargo}
        setFieldLabel={setFieldLabel}
        goodsType={goodsType}
        isOpen={createTnVedCodeModal}
        close={() => setCreateTnVedCodeModal(false)}
      />
      <ModalCreateUpdateTnVedCode
        expandedCargo={expandedCargo}
        mode="edit"
        setFieldLabel={setFieldLabel}
        tnved={tnved.current}
        isOpen={updateTnVedCodeModal}
        close={() => setUpdateTnVedCodeModal(false)}
      />
      <ModalAction
        isOpen={deleteGoodsTypeModal}
        onCancel={() => setDeleteGoodsTypeModal(false)}
        title={t('toDeleteGoodsType')}
        description={t('toDeleteGoodsTypeDescription')}
        onSubmit={onGoodsTypeDelete}
        submitButtonDisabled={confirmLoading}
      />
      <ModalAction
        isOpen={deleteTnVedCodeModal}
        onCancel={() => setDeleteTnVedCodeModal(false)}
        title={t('toDeleteTnVedCode')}
        description={t('toDeleteTnVedCodeDescription')}
        onSubmit={onTnVedCodeDelete}
        submitButtonDisabled={confirmLoading}
      />
    </Box>
  );
});
