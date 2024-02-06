import React, { useEffect, useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, ModalCreateEditPhoneType } from './components';
import {
  deletePhoneType,
  fetchPhoneType,
  fetchPhoneTypeOne,
  fetchPhoneTypes,
  fetchPhoneTypesFilter,
} from '@/store/actions';
import { useOutsideClick } from '@/hooks';
import { declOfNum } from '@/helpers';

const HEAD_ROW = ['phoneNumberType', 'inChinese', 'inRussian', 'inEnglish', 'tableDocAction'];

const phoneSynopsis = ['тип номера телефона', 'типа номера телефона', 'типов номера телефона'];

export const PhoneTypes = ErrorBoundaryHoc(({ setHeadRow, setFieldLabel }) => {
  const phoneTypes = useSelector(state => state.phone.phoneTypes);
  const [modalUpdatePhoneType, setModalUpdatePhoneType] = useState(false);
  const [modalDeletePhoneTypeId, setModalDeletePhoneTypeId] = useState(null);
  const [phoneTypeDeleting, setPhoneTypeDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const onPhoneTypeDelete = async () => {
    setPhoneTypeDeleting(true);
    await dispatch(deletePhoneType({ id: modalDeletePhoneTypeId, searchParams }));
    dispatch(fetchPhoneType());
    setPhoneTypeDeleting(false);
    setModalDeletePhoneTypeId(null);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchPhoneTypes(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchPhoneTypesFilter());
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  return (
    <Box>
      <Table
        loading={loading}
        row={phoneTypes?.results}
        rowProps={{ setModalDeletePhoneTypeId, setModalUpdatePhoneType }}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter setFieldLabel={setFieldLabel} />}
        RowComponent={Row}
        emptyMessage="emptyNumberTypes"
        currentPage={phoneTypes?.page.current_page}
        resultsCount={phoneTypes?.page.results_count}
        footerTags={[
          `${phoneTypes?.page.results_count} ${
            i18n.language.match(/ru|ru-RU/)
              ? declOfNum(phoneTypes?.page.results_count, phoneSynopsis)
              : `${phoneTypes?.page.results_count} ${t('phoneNumberType').toLowerCase()}`
          }`,
        ]}
      />
      <ModalCreateEditPhoneType
        setFieldLabel={setFieldLabel}
        isOpen={modalUpdatePhoneType}
        close={() => setModalUpdatePhoneType(false)}
        mode="edit"
      />
      <ModalAction
        title={t('toDeletePhoneType')}
        description={t('toDeletePhoneTypeDescription')}
        isOpen={!!modalDeletePhoneTypeId}
        onCancel={() => setModalDeletePhoneTypeId(false)}
        onSubmit={onPhoneTypeDelete}
        submitButtonDisabled={phoneTypeDeleting}
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: { id, name, name_ru, name_en, name_zh_hans },
    setModalUpdatePhoneType,
    setModalDeletePhoneTypeId,
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
                      setModalUpdatePhoneType(true);
                      dispatch(fetchPhoneTypeOne(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setModalDeletePhoneTypeId(id)}
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
