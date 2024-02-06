import s from '@components/Table/index.module.scss';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { fetchCityDetail, fetchCountry, fetchCountryCities } from '@/store/actions';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon, Table } from '@/components';
import { useTableActionPosition } from '@hooks/useTableActionPosition';
import { useOutsideClick } from '@/hooks';

const DROPDOWN_TABLE_HEAD = ['cityName', 'inChinese', 'inRussian', 'inEnglish', '', '', ''];

export const Row = ErrorBoundaryHoc(
  ({
    item,
    setEditCountryModal,
    setCountryIdToDelete,
    setCountryIdToCreateCity,
    setCountryIdToUpdateCity,
    setCityIdToDelete,
    setHeadRow,
    setExpandedCountries,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const { t, i18n } = useTranslation();
    const [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes] =
      useTableActionPosition();
    useOutsideClick([actionOpenerRef, dropdownRef], () => setActionOpen(false));
    const dispatch = useDispatch();

    const onTrClick = async () => {
      setDropdownOpen(!dropdownOpen);
      if (!dropdownOpen) {
        setCitiesLoading(true);
        await dispatch(fetchCountryCities({ id: item.id, name: item.name }));
        setCitiesLoading(false);
      }
    };

    useEffect(() => {
      setExpandedCountries(state => {
        if (dropdownOpen) return [...state, { id: item.id, name: item.name }];
        return state.filter(({ id }) => id !== item.id);
      });
    }, [dropdownOpen]);

    return (
      <>
        <tr onClick={onTrClick} className={clsx(dropdownOpen && s.dropdownOpen)}>
          <td className={s.text}>{item.name}</td>
          <td className={s.text}>{item.letter_for_code}</td>
          <td className={s.text}>{item.phone_code}</td>
          <td className={s.text}>{item.city_count}</td>
          {i18n.language !== 'zhHans' && <td className={s.text}>{item.name_zh_hans}</td>}
          {!i18n.language.match(/ru|ru-RU/) && <td className={s.text}>{item.name_ru}</td>}
          {!i18n.language.match(/en|en-US/) && <td className={s.text}>{item.name_en}</td>}
          <td style={{ position: 'relative' }}>
            <div className={s.actionWrap} ref={setActionOpenerRef}>
              <Icon
                iconClass={s.actionIcon}
                iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                onClick={e => {
                  e.stopPropagation();
                  setActionOpen(!actionOpen);
                }}
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
                        setEditCountryModal(true);
                        dispatch(fetchCountry(item.id));
                      }}
                    >
                      <Icon iconId="edit" />
                      <span>{t('modalCreateClientEdit')}</span>
                    </div>
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                      onClick={() => setCountryIdToDelete(item.id)}
                    >
                      <Icon iconId="trash" />
                      <span>{t('delete')}</span>
                    </div>
                    <div
                      className={s.actionDropdownButton}
                      onClick={() => setCountryIdToCreateCity({ id: item.id, name: item.name })}
                    >
                      <Icon iconId="plusCircle" color="#009E61" />
                      <span>{t('addCity')}</span>
                    </div>
                  </div>,
                  document.body
                )}
              <Icon
                iconId="arrowRight"
                color="#0B6BE6"
                style={{ transform: `rotate(${dropdownOpen ? '90deg' : 0})` }}
              />
            </div>
          </td>
        </tr>
        {dropdownOpen && (
          <tr>
            <td colSpan={8}>
              <Table
                tableStyle={{ minWidth: 'auto' }}
                size="small"
                withBorder
                row={item.cities}
                rowProps={{
                  setCountryIdToUpdateCity,
                  setCityIdToDelete,
                }}
                loading={citiesLoading}
                headRow={setHeadRow(DROPDOWN_TABLE_HEAD)}
                RowComponent={DropdownTableRow}
                emptyMessage={t('cityListIsEmpty')}
              />
            </td>
          </tr>
        )}
      </>
    );
  }
);

const DropdownTableRow = ErrorBoundaryHoc(
  ({
    item: { id, name, name_zh_hans, name_ru, name_en },
    setCountryIdToUpdateCity,
    setCityIdToDelete,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const dispatch = useDispatch();
    const [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes] =
      useTableActionPosition(true);
    useOutsideClick([actionOpenerRef, dropdownRef], () => setActionOpen(false));
    const { t, i18n } = useTranslation();

    return (
      <tr>
        <td className={s.text}>{name}</td>
        {i18n.language !== 'zhHans' && <td className={s.text}>{name_zh_hans}</td>}
        {!i18n.language.match(/ru|ru-RU/) && <td className={s.text}>{name_ru}</td>}
        {!i18n.language.match(/en|en-US/) && <td className={s.text}>{name_en}</td>}
        <td></td>
        <td></td>
        <td style={{ position: 'relative' }}>
          <div className={s.actionWrap} ref={setActionOpenerRef}>
            <Icon
              iconClass={s.actionIcon}
              iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
              onClick={e => {
                e.stopPropagation();
                setActionOpen(!actionOpen);
              }}
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
                      setCountryIdToUpdateCity(true);
                      dispatch(fetchCityDetail(id));
                    }}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div className={s.actionDropdownButton} onClick={() => setCityIdToDelete({ id })}>
                    <Icon iconId="trash" color="#DF3B57" />
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
