import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  TableFilter,
  ModalCreateEditDocType,
  Row,
  ModalCreateLimitationByWaypoint,
  ModalCreateEditRule,
  ModalCreateLimitationByStatus,
  ModalCreateLimitationByTransportationType,
  ModalCreateLimitationByContractType,
  ModalCreateLimitationByContainer,
  ModalCreateLimitationByDocType,
  ModalCreateEmptyLimitation,
  ModalCreateLimitationByEmployee,
} from './components';
import {
  deleteDocType,
  deleteRule,
  fetchDocTypeRule,
  fetchDocTypes,
  fetchLimitationsDescription,
} from '@/store/actions';
import { declOfNum } from '@/helpers';

const HEAD_ROW = [
  'tableDocType',
  'maxDocSize',
  'maxDocCount',
  'inChinese',
  'inRussian',
  'inEnglish',
  'tableDocAction',
];

const docTypSynopsis = ['тип документа', 'типа документа', 'типов документов'];

export const AttachedDocTypes = ErrorBoundaryHoc(({ setHeadRow, setFieldLabel }) => {
  const docTypes = useSelector(state => state.documents.docTypes);
  const [modalUpdateDocType, setModalUpdateDocType] = useState(false);
  const [modalCreateRuleId, setModalCreateRuleId] = useState(null);
  const [modalEditRuleId, setModalEditRuleId] = useState(null);
  const [modalDeleteDocId, setModalDeleteDocId] = useState(null);
  const [restrictionToDelete, setRestrictionToDelete] = useState({ isOpen: false });
  const [limitationModal, setLimitationModal] = useState(null);
  const [ruleIdToDelete, setRuleIdToDelete] = useState(null);
  const [dataDeleting, setDataDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const docTypeCount = useMemo(() => {
    if (!docTypes) return [];
    const count = docTypes.total.document_type_count;
    if (i18n.language.match(/ru-RU|ru/)) {
      return [`${count} ${declOfNum(count, docTypSynopsis)}`];
    }
    if (i18n.language === 'zhHans') return [`${count} 文件类型`];
    return [`${count} ${count > 1 ? 'document types' : 'document type'}`];
  }, [docTypes]);

  const onDocDelete = async () => {
    setDataDeleting(true);
    await dispatch(deleteDocType({ id: modalDeleteDocId, searchParams }));
    setDataDeleting(false);
    setModalDeleteDocId(null);
  };

  const onRuleDelete = async () => {
    setDataDeleting(true);
    await dispatch(deleteRule({ id: ruleIdToDelete.id, expandedRow }));
    setDataDeleting(false);
    setRuleIdToDelete(null);
  };

  const onRestrictionDelete = async () => {
    setDataDeleting(true);
    await dispatch(restrictionToDelete.deleteFunc({ id: restrictionToDelete.id, expandedRow }));
    setDataDeleting(false);
    setRestrictionToDelete({ isOpen: false });
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchDocTypes(searchParams)).finally(() => setLoading(false));
    if (expandedRow) {
      dispatch(fetchDocTypeRule(expandedRow));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
    dispatch(fetchLimitationsDescription());
  }, []);

  return (
    <Box>
      <Table
        loading={loading}
        row={docTypes?.results}
        rowProps={{
          setModalDeleteDocId,
          setModalUpdateDocType,
          expandedRow,
          setExpandedRow,
          setLimitationModal,
          setModalCreateRuleId,
          setRuleIdToDelete,
          setModalEditRuleId,
          setRestrictionToDelete,
        }}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter setFieldLabel={setFieldLabel} expandedRowId={expandedRow} />}
        RowComponent={Row}
        emptyMessage="emptyDocTypes"
        currentPage={docTypes?.page.current_page}
        resultsCount={docTypes?.page.results_count}
        footerTags={docTypeCount}
      />
      <ModalCreateEditDocType
        setFieldLabel={setFieldLabel}
        isOpen={modalUpdateDocType}
        close={() => setModalUpdateDocType(false)}
        mode="edit"
        expandedRowId={expandedRow}
      />
      <ModalCreateEditRule
        expandedRowId={expandedRow}
        isOpen={!!modalCreateRuleId}
        close={() => setModalCreateRuleId(null)}
        docType={modalCreateRuleId}
        mode="create"
      />
      <ModalCreateEditRule
        expandedRowId={expandedRow}
        isOpen={!!modalEditRuleId}
        close={() => setModalEditRuleId(null)}
        docType={modalEditRuleId}
        mode="edit"
      />
      <ModalAction
        title={t('toDeleteDocType')}
        description={t('toDeleteAttachedDocTypeDescription')}
        isOpen={!!modalDeleteDocId}
        onCancel={() => setModalDeleteDocId(false)}
        onSubmit={onDocDelete}
        submitButtonDisabled={dataDeleting}
      />
      <ModalCreateLimitationByWaypoint
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'waypoint'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalCreateLimitationByStatus
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'status'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalCreateLimitationByTransportationType
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'transportationType'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalCreateLimitationByContractType
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'contractType'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalCreateLimitationByContainer
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'container'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalCreateLimitationByDocType
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'docType'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalCreateEmptyLimitation
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'empty'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalCreateLimitationByEmployee
        expandedRowId={expandedRow}
        isOpen={limitationModal?.type === 'employee'}
        rule={limitationModal?.id}
        close={() => setLimitationModal(null)}
      />
      <ModalAction
        isOpen={!!ruleIdToDelete}
        onSubmit={onRuleDelete}
        onCancel={() => setRuleIdToDelete(null)}
        title={t('toDeleteRule', { name: ruleIdToDelete?.name })}
        description={t('toDeleteRuleDescription')}
        submitButtonDisabled={dataDeleting}
      />
      <ModalAction
        isOpen={restrictionToDelete.isOpen}
        onSubmit={onRestrictionDelete}
        onCancel={() => setRestrictionToDelete({ ...restrictionToDelete, isOpen: false })}
        title={t(restrictionToDelete?.title)}
        description={t(restrictionToDelete?.description)}
        submitButtonDisabled={dataDeleting}
      />
    </Box>
  );
});
