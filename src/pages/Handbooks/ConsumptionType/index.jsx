import React, { useEffect, useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, ModalCreateEditConsumptionType } from './components';
import {
  deleteConsumptionType,
  fetchConsumptionType,
  fetchConsumptionTypeOne,
} from '@/store/actions';
import { useOutsideClick } from '@/hooks';
import { declOfNum } from '@/helpers';

const HEAD_ROW = [
  'additionalCostType',
  'documentsTypes',
  'inChinese',
  'inRussian',
  'inEnglish',
  'tableDocAction',
];

const consumptionSynopsis = [
  'дополнительный расход',
  'дополнительного расхода',
  'дополнительных расходов',
];

export const ConsumptionType = ErrorBoundaryHoc(({ setHeadRow, setFieldLabel }) => {
  const consumptionType = useSelector(state => state.documents.consumptionType);
  const [modalUpdateConsumptionType, setModalUpdateConsumptionType] = useState(false);
  const [modalDeleteConsumptionTypeId, setModalDeleteConsumptionTypeId] = useState(null);
  const [consumptionTypeDeleting, setConsumptionTypeDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const onConsumptionTypeDelete = async () => {
    setConsumptionTypeDeleting(true);
    await dispatch(deleteConsumptionType({ id: modalDeleteConsumptionTypeId, searchParams }));
    setConsumptionTypeDeleting(false);
    setModalDeleteConsumptionTypeId(null);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchConsumptionType(searchParams)).finally(() => setLoading(false));
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
        row={consumptionType?.results}
        rowProps={{ setModalDeleteConsumptionTypeId, setModalUpdateConsumptionType }}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter setFieldLabel={setFieldLabel} />}
        RowComponent={Row}
        emptyMessage="emptyConsumptionType"
        currentPage={consumptionType?.page.current_page}
        resultsCount={consumptionType?.page.results_count}
        footerTags={[
          `${consumptionType?.page.results_count} ${
            i18n.language.match(/ru|ru-RU/)
              ? declOfNum(consumptionType?.page.results_count, consumptionSynopsis)
              : `${consumptionType?.page.results_count} ${t('additionalConsumption').toLowerCase()}`
          }`,
        ]}
      />
      <ModalCreateEditConsumptionType
        setFieldLabel={setFieldLabel}
        isOpen={modalUpdateConsumptionType}
        close={() => setModalUpdateConsumptionType(false)}
        mode="edit"
      />
      <ModalAction
        title={t('toDeleteConsumptionType')}
        description={t('toDeleteConsumptionTypeDescription')}
        isOpen={!!modalDeleteConsumptionTypeId}
        onCancel={() => setModalDeleteConsumptionTypeId(false)}
        onSubmit={onConsumptionTypeDelete}
        submitButtonDisabled={consumptionTypeDeleting}
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: { id, name, name_ru, name_en, name_zh_hans, doc_type },
    setModalUpdateConsumptionType,
    setModalDeleteConsumptionTypeId,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>{name}</td>
        <td className={s.text}>{doc_type.name}</td>
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
                      setModalUpdateConsumptionType(true);
                      dispatch(fetchConsumptionTypeOne(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setModalDeleteConsumptionTypeId(id)}
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
