import React, { useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import mainStyle from '../index.module.scss';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { useOutsideClick } from '@/hooks';
import { Icon, Table } from '@/components';
import { fetchDocType, fetchDocTypeRule } from '@/store/actions';
import { RuleRow } from './RuleRow';

const RULE_TABLE_HEAD = ['ruleName', 'limitations', '', '', '', '', ''];

export const Row = ErrorBoundaryHoc(
  ({
    item: { id, name, name_ru, name_en, name_zh_hans, max_count, max_size, limitations },
    setModalUpdateDocType,
    setModalDeleteDocId,
    expandedRow,
    setExpandedRow,
    setLimitationModal,
    setModalCreateRuleId,
    setRuleIdToDelete,
    setModalEditRuleId,
    setRestrictionToDelete,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    const onTrClick = () => {
      setExpandedRow(expandedRow === id ? null : id);
      if (expandedRow !== id) {
        setLoading(true);
        dispatch(fetchDocTypeRule(id)).finally(() => setLoading(false));
      }
    };

    return (
      <>
        <tr
          onClick={onTrClick}
          style={{
            cursor: 'pointer',
            ...(expandedRow === id && { borderBottom: 'none' }),
          }}
        >
          <td className={s.text}>{name}</td>
          <td className={s.text}>
            {max_size} {i18n.language.match(/ru-RU|ru/) ? 'МБ' : 'MB'}
          </td>
          <td className={s.text}>{max_count}</td>
          {i18n.language !== 'zhHans' && <td className={s.text}>{name_zh_hans}</td>}
          {!i18n.language.match(/ru-RU|ru/) && <td className={s.text}>{name_ru}</td>}
          {!i18n.language.match(/en-US|en/) && <td className={s.text}>{name_en}</td>}
          <td style={{ position: 'relative' }}>
            <div className={s.actionWrap}>
              <div ref={ref} onClick={e => e.stopPropagation()}>
                <Icon
                  iconClass={s.actionIcon}
                  iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                  onClick={() => setActionOpen(!actionOpen)}
                  clickable
                />
                <Icon
                  iconId="arrowRight"
                  color="#0B6BE6"
                  style={{
                    margin: '0 0 0 auto',
                    transform: `rotate(${expandedRow === id ? '90deg' : 0})`,
                  }}
                  onClick={onTrClick}
                />
                {actionOpen && (
                  <div className={s.actionDropdown}>
                    <div
                      className={s.actionDropdownButton}
                      onClick={() => setModalCreateRuleId({ id, name })}
                    >
                      <Icon iconId="plusCircle" color="#009E61" />
                      <span>{t('addRule')}</span>
                    </div>
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                      onClick={() => {
                        setModalUpdateDocType(true);
                        dispatch(fetchDocType(id));
                      }}
                    >
                      <Icon iconId="edit" />
                      <span>{t('modalCreateClientEdit')}</span>
                    </div>
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                      onClick={() => setModalDeleteDocId(id)}
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
        {expandedRow === id && (
          <tr>
            <td colSpan={7}>
              <Table
                loading={loading}
                rootTableStyle={{ marginBottom: window.innerWidth > 1440 ? 30 : 16 }}
                headRow={
                  window.innerWidth > 1440
                    ? RULE_TABLE_HEAD
                    : RULE_TABLE_HEAD.slice(0, RULE_TABLE_HEAD.length - 2)
                }
                size="small"
                withBorder
                row={limitations}
                rowProps={{
                  setLimitationModal,
                  setRuleIdToDelete,
                  setModalEditRuleId,
                  setRestrictionToDelete,
                }}
                emptyMessage={t('emptyRuleList')}
                RowComponent={RuleRow}
                className={mainStyle.table}
              />
            </td>
          </tr>
        )}
      </>
    );
  }
);
