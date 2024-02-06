import s from '@components/Table/index.module.scss';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { uppercase } from '@/helpers';
import { fetchCustomClearanceTariffDetail } from '@/store/actions';
import { ErrorBoundaryHoc, Icon, Table } from '@/components';
import { useTableActionPosition } from '@hooks/useTableActionPosition';
import { useOutsideClick } from '@/hooks';

const HEAD_ROW = ['goodsTypeFilter', 'perUnitBilling', 'cost', 'markup', '', 'tableDocAction'];

export const Row = ErrorBoundaryHoc(
  ({ setModalDeleteTariffId, setModalUpdateTariff, tariffs, tableWrapRef }) => {
    const [tableRef, setTableRef] = useState(null);

    const setTableStyle = () => {
      if (tableRef && tableWrapRef) {
        const offset = window.innerWidth > 1440 ? 80 : 60;
        return {
          maxHeight: tableWrapRef.clientHeight - tableRef.offsetTop - offset,
        };
      }
    };

    return (
      <tr style={{ borderBottom: 'none' }}>
        <td style={{ paddingTop: 20 }}>
          <Table
            size="small"
            withBorder
            row={tariffs}
            rowProps={{ setModalDeleteTariffId, setModalUpdateTariff }}
            headRow={window.innerWidth > 1600 ? HEAD_ROW : HEAD_ROW.filter(th => th !== '')}
            emptyMessage="emptyTariffsList"
            RowComponent={RowItem}
            tableStyle={{ minWidth: 'auto' }}
            onWrapRef={setTableRef}
            rootTableStyle={setTableStyle()}
          />
        </td>
      </tr>
    );
  }
);

const RowItem = ErrorBoundaryHoc(
  ({
    item: { id, goods_type, for_piece, price, currency, additional_price },
    setModalDeleteTariffId,
    setModalUpdateTariff,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes] =
      useTableActionPosition(true);
    useOutsideClick([actionOpenerRef, dropdownRef], () => setActionOpen(false));

    return (
      <tr>
        <td className={s.text}>{goods_type.name}</td>
        <td className={s.text}>{uppercase(t(for_piece ? 'yes' : 'no'))}</td>
        <td className={s.text}>
          {price} {currency}
        </td>
        <td className={s.text}>
          {additional_price} {currency}
        </td>
        {window.innerWidth > 1600 && <td />}
        <td style={{ position: 'relative' }}>
          <div className={s.actionWrap} ref={setActionOpenerRef}>
            <Icon
              iconClass={s.actionIcon}
              iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
              onClick={() => setActionOpen(!actionOpen)}
              clickable
            />
            {actionOpen &&
              createPortal(
                <div
                  className={s.actionDropdown}
                  ref={setDropdownRef}
                  style={styles.popper}
                  {...attributes.popper}
                  onClick={e => e.stopPropagation()}
                >
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                    onClick={() => {
                      setModalUpdateTariff(true);
                      dispatch(fetchCustomClearanceTariffDetail(id));
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
