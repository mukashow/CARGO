import s from '@components/Table/index.module.scss';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import { ErrorBoundaryHoc, Icon, Table } from '@/components';
import { fetchGoodsTypeTnved } from '@actions/goods';
import { useTableActionPosition } from '@hooks/useTableActionPosition';
import { useOutsideClick } from '@/hooks';

const HEAD_ROW = [
  'tnVedCodeName',
  'code',
  'inChinese',
  'inRussian',
  'inEnglish',
  '',
  'tableDocAction',
];

export const Row = ErrorBoundaryHoc(
  ({
    item,
    setUpdateGoodsTypeModal,
    setCreateTnVedCodeModal,
    setUpdateTnVedCodeModal,
    setDeleteTnVedCodeModal,
    setDeleteGoodsTypeModal,
    goodsType,
    tnved,
    setHeadRow,
    setExpandedCargo,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes] =
      useTableActionPosition();
    const [loading, setLoading] = useState(false);
    useOutsideClick([actionOpenerRef, dropdownRef], () => setActionOpen(false));
    const { id, name, name_en, name_ru, name_zh_hans, tnved_count, symbol } = item;

    const onTrClick = () => {
      setDropdownOpen(!dropdownOpen);
      if (!dropdownOpen) {
        setLoading(true);
        dispatch(fetchGoodsTypeTnved(item.id)).finally(() => setLoading(false));
      }
    };

    useEffect(() => {
      setExpandedCargo(state => {
        if (dropdownOpen) return [...state, item.id];
        return state.filter(id => id !== item.id);
      });
    }, [dropdownOpen]);

    return (
      <>
        <tr onClick={onTrClick} className={clsx(dropdownOpen && s.dropdownOpen, s.clickable)}>
          <td className={s.text}>{name}</td>
          {i18n.language !== 'zhHans' && <td className={s.text}>{name_zh_hans}</td>}
          {!i18n.language.match(/ru|ru-RU/) && <td className={s.text}>{name_ru}</td>}
          {!i18n.language.match(/en|en-US/) && <td className={s.text}>{name_en}</td>}
          <td className={s.text}>{symbol}</td>
          <td className={s.text}>{tnved_count}</td>
          {window.innerWidth > 1440 && <td />}
          <td style={{ position: 'relative' }}>
            <div className={s.actionWrap} ref={setActionOpenerRef}>
              <Icon
                iconClass={s.actionIcon}
                iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                onClick={e => {
                  setActionOpen(!actionOpen);
                  e.stopPropagation();
                }}
                clickable
              />
              <Icon
                iconId="arrowRight"
                color="#0B6BE6"
                style={{ transform: `rotate(${dropdownOpen ? '90deg' : 0})` }}
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
                        setUpdateGoodsTypeModal(true);
                        goodsType.current = item;
                      }}
                    >
                      <Icon iconId="edit" />
                      <span>{t('modalCreateClientEdit')}</span>
                    </div>
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                      onClick={() => {
                        setDeleteGoodsTypeModal(true);
                        goodsType.current = item;
                      }}
                    >
                      <Icon iconId="trash" />
                      <span>{t('delete')}</span>
                    </div>
                    <div
                      className={s.actionDropdownButton}
                      onClick={() => {
                        setCreateTnVedCodeModal(true);
                        goodsType.current = item;
                      }}
                    >
                      <Icon iconId="plusCircle" color="#009E61" />
                      <span>
                        {t('add')} {t('tnVedCode')}
                      </span>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </td>
        </tr>
        {dropdownOpen && (
          <tr>
            <td colSpan={window.innerWidth > 1440 ? 7 : 6}>
              <Table
                tableStyle={{ minWidth: 'auto' }}
                size="small"
                withBorder
                row={item?.tnved}
                loading={loading}
                rowProps={{
                  setUpdateTnVedCodeModal,
                  setDeleteTnVedCodeModal,
                  tnved,
                  goods_type: { id, name },
                }}
                headRow={
                  window.innerWidth > 1440
                    ? setHeadRow(HEAD_ROW)
                    : setHeadRow(HEAD_ROW.filter(th => !!th))
                }
                RowComponent={DropdownRow}
                emptyMessage={t('goodsTypesEmpty')}
              />
            </td>
          </tr>
        )}
      </>
    );
  }
);

const DropdownRow = ErrorBoundaryHoc(
  ({ item, setUpdateTnVedCodeModal, setDeleteTnVedCodeModal, tnved, goods_type }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes] =
      useTableActionPosition(true);
    useOutsideClick([actionOpenerRef, dropdownRef], () => setActionOpen(false));
    const { t, i18n } = useTranslation();
    const { name, code, name_en, name_ru, name_zh_hans } = item;

    return (
      <tr>
        <td className={s.text}>{name}</td>
        <td className={s.text}>{code}</td>
        {i18n.language !== 'zhHans' && <td className={s.text}>{name_zh_hans}</td>}
        {!i18n.language.match(/ru|ru-RU/) && <td className={s.text}>{name_ru}</td>}
        {!i18n.language.match(/en|en-US/) && <td className={s.text}>{name_en}</td>}
        {window.innerWidth > 1440 && <td />}
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
                      setUpdateTnVedCodeModal(true);
                      tnved.current = { ...item, goods_type };
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                    onClick={() => {
                      setDeleteTnVedCodeModal(true);
                      tnved.current = { ...item, goods_type };
                    }}
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
