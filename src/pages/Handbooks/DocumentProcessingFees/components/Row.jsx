import mainStyle from '../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientDocTariff } from '@/store/actions';
import { ErrorBoundaryHoc, Icon, Table } from '@/components';
import { useTableActionPosition } from '@hooks/useTableActionPosition';
import { useOutsideClick } from '@/hooks';

const HEAD_ROW = ['clientCodeClient', 'percent', '', '', ''];

export const Row = ErrorBoundaryHoc(
  ({ setModalDeleteTariffId, setModalUpdateTariff, tableWrapRef }) => {
    const { docFees, docFee } = useSelector(state => ({
      docFees: state.tariff.clientDocProcFee,
      docFee: state.tariff.docProcFee,
    }));
    const [tableRef, setTableRef] = useState(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const setTableStyle = () => {
      if (tableRef && tableWrapRef) {
        const offset = window.innerWidth > 1440 ? 84 : 64;
        return {
          maxHeight: tableWrapRef.clientHeight - tableRef.offsetTop - offset,
        };
      }
    };

    return (
      <tr style={{ borderBottom: 'none' }}>
        <td style={{ paddingTop: 20 }}>
          <div className={mainStyle.percentage}>
            <p>
              {t('totalPercent')}: {docFee ? `${docFee.percent} %` : t('tariffIsNotSet')}
            </p>
            {docFee && (
              <>
                <Icon
                  iconId="edit"
                  color="#0B6BE6"
                  style={{ marginRight: 12 }}
                  clickable
                  onClick={() => {
                    setModalUpdateTariff('noClient');
                    dispatch(fetchClientDocTariff({ id: docFee.id }));
                  }}
                />
                <Icon
                  iconId="trash"
                  color="#DF3B57"
                  clickable
                  onClick={() => setModalDeleteTariffId(docFee.id)}
                />
              </>
            )}
          </div>
          <Table
            size="small"
            withBorder
            row={docFees?.results}
            rootTableStyle={setTableStyle()}
            rowProps={{ setModalDeleteTariffId, setModalUpdateTariff }}
            headRow={window.innerWidth > 1600 ? HEAD_ROW : HEAD_ROW.slice(0, 4)}
            emptyMessage="tariffIsNotSet"
            RowComponent={RowItem}
            tableStyle={{ minWidth: 'auto' }}
            onWrapRef={setTableRef}
          />
        </td>
      </tr>
    );
  }
);

const RowItem = ErrorBoundaryHoc(
  ({ item: { id, client_code, percent }, setModalDeleteTariffId, setModalUpdateTariff }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes] =
      useTableActionPosition(true);
    useOutsideClick([actionOpenerRef, dropdownRef], () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>{client_code}</td>
        <td className={s.text}>{percent}%</td>
        <td />
        {window.innerWidth > 1600 && <td />}
        <td style={{ position: 'relative' }}>
          <div className={s.actionWrap} ref={setActionOpenerRef}>
            <Icon
              iconClass={s.actionIcon}
              iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
              onClick={() => setActionOpen(!actionOpen)}
              clickable
              style={{ marginLeft: 'auto' }}
            />
            {actionOpen &&
              createPortal(
                <div
                  className={s.actionDropdown}
                  ref={setDropdownRef}
                  style={styles.popper}
                  {...attributes.popper}
                >
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                    onClick={() => {
                      setModalUpdateTariff('forClient');
                      dispatch(fetchClientDocTariff({ id, client_code }));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => setModalDeleteTariffId(id)}
                  >
                    <Icon iconId="trash" />
                    <span>{t('delete')}</span>
                  </div>
                </div>,
                document.body
              )}
          </div>
        </td>
      </tr>
    );
  }
);
