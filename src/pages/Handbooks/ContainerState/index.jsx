import React, { useEffect, useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, ModalCreateEditContainerState } from './components';
import {
  deleteContainerState,
  fetchAllContainersState,
  fetchContainerStateOne,
  fetchContainersState,
} from '@/store/actions';
import { useOutsideClick } from '@/hooks';
import { declOfNum } from '@/helpers';

const HEAD_ROW = ['stateName', 'inChinese', 'inRussian', 'inEnglish', 'tableDocAction'];

const containerSynopsis = [
  'состояние контейнера ',
  'состояния контейнера',
  'состояний контейнеров',
];

export const ContainerState = ErrorBoundaryHoc(({ setHeadRow, setFieldLabel }) => {
  const containers = useSelector(state => state.container.containersState);
  const [modalUpdateContainer, setModalUpdateContainer] = useState(false);
  const [containerIdToDelete, setContainerIdToDelete] = useState(null);
  const [containerDeleting, setContainerDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const onContainerDelete = async () => {
    setContainerDeleting(true);
    await dispatch(deleteContainerState({ id: containerIdToDelete, searchParams }));
    setContainerDeleting(false);
    setContainerIdToDelete(null);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchContainersState(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchAllContainersState());
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  return (
    <Box>
      <Table
        loading={loading}
        row={containers?.results}
        rowProps={{ setContainerIdToDelete, setModalUpdateContainer }}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter setFieldLabel={setFieldLabel} />}
        RowComponent={Row}
        emptyMessage="emptyContainersState"
        currentPage={containers?.page.current_page}
        resultsCount={containers?.page.results_count}
        footerTags={[
          `${containers?.page.results_count} ${
            i18n.language.match(/ru|ru-RU/)
              ? declOfNum(containers?.page.results_count, containerSynopsis)
              : `${containers?.page.results_count} ${t('containerState').toLowerCase()}`
          }`,
        ]}
      />
      <ModalCreateEditContainerState
        setFieldLabel={setFieldLabel}
        isOpen={modalUpdateContainer}
        close={() => setModalUpdateContainer(false)}
        mode="edit"
      />
      <ModalAction
        title={t('toDeleteContainerState')}
        description={t('toDeleteContainerStateDescription')}
        isOpen={!!containerIdToDelete}
        onCancel={() => setContainerIdToDelete(false)}
        onSubmit={onContainerDelete}
        submitButtonDisabled={containerDeleting}
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: { id, name, name_ru, name_en, name_zh_hans },
    setModalUpdateContainer,
    setContainerIdToDelete,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>{name}</td>
        {i18n.language !== 'zhHans' && <td className={s.text}>{name_zh_hans}</td>}
        {!i18n.language.match(/ru-RU|ru/) && <td className={s.text}>{name_ru}</td>}
        {!i18n.language.match(/en-US|en/) && <td className={s.text}>{name_en}</td>}
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
                      setModalUpdateContainer(true);
                      dispatch(fetchContainerStateOne(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setContainerIdToDelete(id)}
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
