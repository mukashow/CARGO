import s from '@components/Table/index.module.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Checkbox, Icon, Table, TableChain } from '@components';
import {
  deletePlacesFromCargo,
  fetchCargoPlaces,
  setActsPlacesCount,
  setPlacesToCargo,
} from '@actions';
import { GoodsModalDropdownRow } from './GoodsModalDropdownRow';

const DROPDOWN_HEAD_ROW = [
  'pick',
  'goodsTypeFilter',
  'tnVedCode',
  'seatsNumber',
  'weight',
  'volume',
  'tariff',
  'sum',
];

export const GoodsModalRow = ({
  item: {
    id,
    acceptance_date,
    receiver,
    contract_type,
    direction: { point_from_name, custom_clearance_country_name, point_to_name },
    place_count,
    weight,
    volume,
    cost,
    currency,
    tags,
    goods_list,
    goods_list_with_1_place,
    status,
    selectedPlacesCount,
    is_extra,
    is_first_extra_el,
  },
  setPlaceModalOpen,
  setPlacesLoading,
}) => {
  const adds = useSelector(state => state.bill.places.adds);
  const deletes = useSelector(state => state.bill.places.deletes);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const params = useParams();

  const direction = custom_clearance_country_name
    ? [
        { title: point_from_name },
        { title: custom_clearance_country_name },
        { title: point_to_name },
      ]
    : [{ title: point_from_name }, { title: point_to_name }];

  const onChange = useCallback(async () => {
    const goods = await Promise.all(
      goods_list.map(async ({ id }) => {
        const data = await dispatch(fetchCargoPlaces({ billId: params.id, cargoId: id })).unwrap();
        return {
          places: data.place_list,
          cargoId: id,
        };
      })
    );

    if (selectedPlacesCount === 0) {
      goods.forEach(cargo => {
        dispatch(setPlacesToCargo({ ...cargo, actId: id }));
      });
      return;
    }
    goods.forEach(cargo => {
      dispatch(deletePlacesFromCargo({ ...cargo, actId: id, isExtra: is_extra }));
    });
  }, [selectedPlacesCount]);

  useEffect(() => {
    dispatch(setActsPlacesCount({ id, isExtra: is_extra }));
  }, [deletes, adds]);

  return (
    <>
      {!!is_first_extra_el && (
        <tr>
          <td style={{ color: '#DF3B57', fontStyle: 'italic', fontWeight: '500' }}>
            {t('extraGoods')}
          </td>
        </tr>
      )}
      <tr
        style={{ cursor: 'default', fontSize: 12, ...(dropdownOpen && { borderBottom: 'none' }) }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <td>
          <div className={s.textFlex}>
            <div onClick={e => e.stopPropagation()} style={{ marginRight: 24 }}>
              <Checkbox
                checked={!!selectedPlacesCount}
                variant={selectedPlacesCount === place_count ? 'fill' : 'default'}
                size="big"
                onChange={onChange}
              />
            </div>
            #{id}
          </div>
        </td>
        <td className={s.text}>{acceptance_date?.slice(0, 10)}</td>
        <td className={s.text}>{receiver?.code}</td>
        <td className={s.text}>{contract_type?.name}</td>
        <td>
          <TableChain chain={direction} />
        </td>
        <td className={s.text}>
          {place_count} {t('seats')}
        </td>
        <td className={s.text}>
          {weight} {t('weightKg')}
        </td>
        <td className={s.text}>
          {volume} {t('cubicMeter')}
        </td>
        <td className={s.text} style={{ whiteSpace: 'nowrap' }}>
          {cost} {currency.symbol}
        </td>
        <td className={s.text}>{tags.map(({ name }) => name).join(', ')}</td>
        <td>
          <div className={s.status}>
            <span data-status-type="goodsAcceptance" data-status={status?.id}>
              {status?.name}
            </span>
          </div>
        </td>
        <td>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Icon
              style={{ rotate: dropdownOpen ? '90deg' : '0deg' }}
              clickable
              iconId="arrowRight"
              color="#0B6BE6"
            />
          </div>
        </td>
      </tr>
      {dropdownOpen && (
        <tr>
          <td colSpan={12} style={{ paddingBottom: 30 }}>
            <Table
              withBorder
              size="small"
              headRow={DROPDOWN_HEAD_ROW}
              RowComponent={GoodsModalDropdownRow}
              row={!!is_extra ? goods_list_with_1_place : goods_list}
              rowProps={{ setPlaceModalOpen, setPlacesLoading, actId: id, is_extra: !!is_extra }}
            />
          </td>
        </tr>
      )}
    </>
  );
};
