import mainStyle from '../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon, Table } from '@/components';
import {
  fetchBorderPointDetail,
  fetchPointDirectionsAndRoutes,
  fetchTerminalPointDetail,
  fetchWarehousePointDetail,
} from '@actions/point';
import { useOutsideClick } from '@/hooks';

const DIRECTION_HEAD_ROW = ['directions', 'customCountry'];
const ROUTE_HEAD_ROW = ['routes'];

export const Row = ErrorBoundaryHoc(
  ({
    item: {
      id,
      point_type,
      border_point_detail,
      warehouse_point_detail,
      terminal_point_detail,
      name,
      name_zh_hans,
      name_en,
      name_ru,
      route_count,
      direction_count,
      directions,
      routes,
    },
    setModalEditWaypoint,
    setModalEditWarehouseWaypoint,
    setModalEditTerminalWaypoint,
    setDeleteWaypointModalId,
    setExpandedPoints,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const ref = useRef();
    useOutsideClick(ref, () => setActionOpen(false));

    const onEdit = () => {
      if (border_point_detail) {
        setModalEditWaypoint(true);
        dispatch(fetchBorderPointDetail(id));
        return;
      }
      if (terminal_point_detail) {
        setModalEditTerminalWaypoint(true);
        dispatch(fetchTerminalPointDetail(id));
        return;
      }
      setModalEditWarehouseWaypoint(true);
      dispatch(fetchWarehousePointDetail(id));
    };

    const onTrClick = () => {
      setExpandedPoints(state => {
        if (state.includes(id)) return state.filter(pointId => pointId !== id);
        return [...state, id];
      });
      setDropdownOpen(!dropdownOpen);
      if (!dropdownOpen) {
        setLoading(true);
        dispatch(fetchPointDirectionsAndRoutes(id)).finally(() => setLoading(false));
      }
    };

    return (
      <>
        <tr
          onClick={onTrClick}
          className={s.clickable}
          style={{ ...(dropdownOpen && { borderBottom: 'none' }) }}
        >
          <td className={s.text}>{point_type.name}</td>
          <td className={s.text}>
            {border_point_detail ? (
              <div>
                <p style={{ whiteSpace: 'nowrap' }} title={border_point_detail.country.name}>
                  {t('clientCountry')}: {border_point_detail.country.name}
                </p>
                <p style={{ whiteSpace: 'nowrap' }} title={border_point_detail.from_country.name}>
                  {t('fromCountry')}: {border_point_detail.from_country.name}
                </p>
                <p style={{ whiteSpace: 'nowrap' }} title={border_point_detail.to_country.name}>
                  {t('toCountry')}: {border_point_detail.to_country.name}
                </p>
              </div>
            ) : warehouse_point_detail ? (
              <div>
                <p style={{ whiteSpace: 'nowrap' }} title={warehouse_point_detail.warehouse_name}>
                  {t('warehouse')} {warehouse_point_detail.warehouse_name}
                </p>
                <p style={{ whiteSpace: 'nowrap' }} title={warehouse_point_detail.city.name}>
                  {t('city')}: {warehouse_point_detail.city.name}
                </p>
                <p style={{ whiteSpace: 'nowrap' }} title={warehouse_point_detail.country.name}>
                  {t('clientCountry')}: {warehouse_point_detail.country.name}
                </p>
              </div>
            ) : (
              terminal_point_detail && (
                <div>
                  <p style={{ whiteSpace: 'nowrap' }} title={terminal_point_detail.country.name}>
                    {t('clientCountry')}: {terminal_point_detail.country.name}
                  </p>
                  {terminal_point_detail.city && (
                    <p style={{ whiteSpace: 'nowrap' }} title={terminal_point_detail.city.name}>
                      {t('city')}: {terminal_point_detail.city.name}
                    </p>
                  )}
                </div>
              )
            )}
          </td>
          <td className={s.text}>{name}</td>
          <td className={s.text}>{direction_count}</td>
          <td className={s.text}>{route_count}</td>
          {i18n.language !== 'zhHans' && <td className={s.text}>{name_zh_hans}</td>}
          {!i18n.language.match(/ru|ru-RU/) && <td className={s.text}>{name_ru}</td>}
          {!i18n.language.match(/en|en-US/) && <td className={s.text}>{name_en}</td>}
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
                  onClick={onTrClick}
                  style={{ transform: `rotate(${dropdownOpen ? 90 : 0}deg)` }}
                />
                {actionOpen && (
                  <div className={s.actionDropdown} onClick={e => e.stopPropagation()}>
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                      onClick={onEdit}
                    >
                      <Icon iconId="edit" />
                      <span>{t('modalCreateClientEdit')}</span>
                    </div>
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                      onClick={() => setDeleteWaypointModalId(id)}
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
        {dropdownOpen && (
          <tr>
            <td colSpan={9} {...(dropdownOpen && { style: { paddingBottom: 16 } })}>
              <div className={mainStyle.dropdownTables}>
                <Table
                  row={directions}
                  headRow={DIRECTION_HEAD_ROW}
                  size="small"
                  withBorder
                  RowComponent={DirectionRow}
                  emptyMessage="emptyDirectionsList"
                  maxHeight={window.innerHeight / 2}
                  loading={loading}
                />
                <Table
                  row={routes}
                  headRow={ROUTE_HEAD_ROW}
                  size="small"
                  withBorder
                  RowComponent={RouteRow}
                  maxHeight={window.innerHeight / 2}
                  loading={loading}
                  emptyMessage="emptyRoutesList"
                />
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }
);

const DirectionRow = ErrorBoundaryHoc(
  ({ item: { custom_clearance_country, point_from, point_to } }) => {
    return (
      <tr>
        <td className={s.text}>
          {point_from.name} - {point_to.name}
        </td>
        <td className={s.text}>{custom_clearance_country?.name}</td>
      </tr>
    );
  }
);

const RouteRow = ErrorBoundaryHoc(({ item }) => {
  return (
    <tr>
      <td className={s.text}>{item.name}</td>
    </tr>
  );
});
