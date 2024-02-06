import React, { useEffect, useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalAction, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { TableFilter, ModalCreateEditCurrency } from './components';
import {
  deleteCurrency,
  fetchAllCurrencies,
  fetchCurrencies,
  fetchCurrencyOne,
} from '@/store/actions';
import { useOutsideClick } from '@/hooks';
import { declOfNum } from '@/helpers';

const HEAD_ROW = [
  'currencyName',
  'currencySymbol',
  'inChinese',
  'inRussian',
  'inEnglish',
  'tableDocAction',
];

const currencySynopsis = ['валюта', 'валюты', 'валют'];

export const Currency = ErrorBoundaryHoc(({ setHeadRow, setFieldLabel }) => {
  const currencies = useSelector(state => state.currency.currencies);
  const [modalUpdateCurrency, setModalUpdateCurrency] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [currencyDeleting, setCurrencyDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const onCurrencyDelete = async () => {
    setCurrencyDeleting(true);
    await dispatch(deleteCurrency({ id: idToDelete, searchParams }));
    setCurrencyDeleting(false);
    setIdToDelete(null);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchCurrencies(searchParams)).finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchAllCurrencies());
    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, []);

  return (
    <Box>
      <Table
        loading={loading}
        row={currencies?.results}
        rowProps={{ setIdToDelete, setModalUpdateCurrency }}
        headRow={setHeadRow(HEAD_ROW)}
        filter={<TableFilter setFieldLabel={setFieldLabel} />}
        RowComponent={Row}
        emptyMessage="emptyCurrency"
        currentPage={currencies?.page.current_page}
        resultsCount={currencies?.page.results_count}
        footerTags={[
          `${currencies?.page.results_count} ${
            i18n.language.match(/ru|ru-RU/)
              ? declOfNum(currencies?.page.results_count, currencySynopsis)
              : `${currencies?.page.results_count} ${t('currencyWord').toLowerCase()}`
          }`,
        ]}
      />
      <ModalCreateEditCurrency
        setFieldLabel={setFieldLabel}
        isOpen={modalUpdateCurrency}
        close={() => setModalUpdateCurrency(false)}
        mode="edit"
      />
      <ModalAction
        title={t('toDeleteCurrency')}
        description={t('toDeleteCurrencyDescription')}
        isOpen={!!idToDelete}
        onCancel={() => setIdToDelete(false)}
        onSubmit={onCurrencyDelete}
        submitButtonDisabled={currencyDeleting}
      />
    </Box>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: { id, name, name_ru, name_en, name_zh_hans, symbol },
    setModalUpdateCurrency,
    setIdToDelete,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>{name}</td>
        <td className={s.text}>{symbol}</td>
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
                      setModalUpdateCurrency(true);
                      dispatch(fetchCurrencyOne(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setIdToDelete(id)}
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
