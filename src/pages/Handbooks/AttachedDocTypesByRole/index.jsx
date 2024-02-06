import React, { useEffect, useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ModalCreateEditDocType, TableFilter } from './components';
import { deleteDocTypeByRole, fetchDocTypeByRoleOne, fetchDocTypesByRole } from '@/store/actions';
import { useOutsideClick } from '@/hooks';
import { declOfNum } from '@/helpers';

const HEAD_ROW = ['tableDocType', 'userRoles', '', '', '', 'tableDocAction'];

const docTypSynopsis = ['тип документа', 'типа документа', 'типов документов'];

export const AttachedDocTypesByRole = ErrorBoundaryHoc(({ setHeadRow }) => {
  const docTypes = useSelector(state => state.documents.docTypesByRole);
  const [updateModal, setUpdateModal] = useState(false);
  const [docTypeIdToDelete, setDocTypeIdToDelete] = useState(null);
  const [docTypeDeleting, setDocTypeDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  const onDocTypeDelete = async () => {
    setDocTypeDeleting(true);
    await dispatch(deleteDocTypeByRole({ id: docTypeIdToDelete, searchParams }));
    setDocTypeDeleting(false);
    setDocTypeIdToDelete(null);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchDocTypesByRole(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  return (
    <Box>
      <Table
        loading={loading}
        row={docTypes?.results}
        rowProps={{ setDocTypeIdToDelete, setUpdateModal }}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter />}
        RowComponent={Row}
        currentPage={docTypes?.page.current_page}
        resultsCount={docTypes?.page.results_count}
        emptyMessage="emptyAttachedDocTypeByRole"
        footerTags={[
          `${docTypes?.page.results_count} ${
            i18n.language.match(/ru|ru-RU/)
              ? declOfNum(docTypes?.page.results_count, docTypSynopsis)
              : `${docTypes?.page.results_count} ${t('tableDocType').toLowerCase()}`
          }`,
        ]}
      />
      <ModalAction
        title={t('toDeleteAttachedDocTypeByRole')}
        description={t('toDeleteAttachedDocTypeByRoleDescription')}
        isOpen={!!docTypeIdToDelete}
        onCancel={() => setDocTypeIdToDelete(false)}
        onSubmit={onDocTypeDelete}
        submitButtonDisabled={docTypeDeleting}
      />
      <ModalCreateEditDocType
        isOpen={updateModal}
        close={() => setUpdateModal(false)}
        mode="edit"
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({ item: { id, name, role_list }, setUpdateModal, setDocTypeIdToDelete }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>{name}</td>
        <td className={s.text}>{role_list.map(({ name }) => name).join(', ')}</td>
        <td />
        <td />
        <td />
        <td style={{ position: 'relative' }}>
          <div className={s.actionWrap}>
            <div ref={ref}>
              <Icon
                iconClass={s.actionIcon}
                iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                onClick={() => setActionOpen(!actionOpen)}
                clickable
              />
              {actionOpen && (
                <div className={s.actionDropdown} onClick={e => e.stopPropagation()}>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                    onClick={() => {
                      setUpdateModal(true);
                      dispatch(fetchDocTypeByRoleOne(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setDocTypeIdToDelete(id)}
                  >
                    <Icon iconId="trash" />
                    <span>{t('delete')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }
);
