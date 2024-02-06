import style from '../../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectOrigin } from '@selectors/bill';
import { Checkbox, Icon } from '@components';
import {
  deletePlacesFromCargo,
  fetchCargoPlaces,
  fetchPlacesForAddingToBill,
  removePlaceFromList,
  setGoodsSelectedPlaceCount,
  setPlaceToList,
  setPlacesToCargo,
} from '@actions';
import { useOutsideClick } from '@hooks';

export const GoodsModalDropdownRow = props => {
  if (props.is_extra) return <OnlyPlaceRow {...props} />;
  return <Row {...props} />;
};

function Row({
  item: {
    id: cargoId,
    place_count,
    goods_type,
    tnved,
    weight,
    volume,
    tariff,
    cost,
    currency,
    unit_of_measure,
    selectedPlacesCount,
  },
  setPlaceModalOpen,
  setPlacesLoading,
  actId,
  is_extra,
}) {
  const adds = useSelector(state => state.bill.places.adds);
  const deletes = useSelector(state => state.bill.places.deletes);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams();

  const onOpenPlaces = () => {
    setPlacesLoading(true);
    setPlaceModalOpen(true);
    dispatch(fetchPlacesForAddingToBill({ billId: id, cargoId, actId, is_extra })).finally(() =>
      setPlacesLoading(false)
    );
  };

  const onChange = async () => {
    const data = await dispatch(fetchCargoPlaces({ billId: id, cargoId })).unwrap();

    if (selectedPlacesCount === 0) {
      dispatch(setPlacesToCargo({ actId, cargoId, places: data.place_list, isExtra: is_extra }));
      return;
    }
    dispatch(deletePlacesFromCargo({ actId, cargoId, places: data.place_list, isExtra: is_extra }));
  };

  useEffect(() => {
    dispatch(setGoodsSelectedPlaceCount({ actId, cargoId, isExtra: is_extra }));
  }, [adds, deletes]);

  return (
    <tr style={{ fontSize: 12 }}>
      <td>
        <div className={s.textFlex}>
          <Checkbox
            checked={selectedPlacesCount > 0}
            variant={selectedPlacesCount === place_count ? 'fill' : 'default'}
            size="big"
            containerStyle={{ marginRight: 16 }}
            onChange={onChange}
          />
          <div
            className={s.textFlex}
            style={{ cursor: 'pointer', color: '#0B6BE6' }}
            onClick={onOpenPlaces}
          >
            <Icon iconId="chevronRightThin" iconWidth={16} iconHeight={16} />
            <span style={{ marginLeft: 4 }}>
              {selectedPlacesCount}/{place_count} {t('seats')}
            </span>
          </div>
        </div>
      </td>
      <td className={s.text}>{goods_type?.name}</td>
      <td>
        <div className={s.textFlex}>
          <span>{tnved?.code}</span>
          <span style={{ color: '#828282', marginLeft: 4 }}>{tnved?.name}</span>
        </div>
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
      <td className={s.text}>
        {tariff} {unit_of_measure === 'm3' ? t('forCubicMeter') : t('forKg')}
      </td>
      <td className={s.text}>
        {cost} {currency?.symbol}
      </td>
    </tr>
  );
}

function OnlyPlaceRow({
  item: {
    id: cargoId,
    place_count,
    goods_type,
    tnved,
    weight,
    volume,
    tariff,
    cost,
    currency,
    unit_of_measure,
    is_added,
    place_id,
    next_warehouse,
    loading_list,
  },
  actId,
}) {
  const addsCargo = useSelector(state =>
    selectOrigin(state.bill, 'adds', { actId, cargoId }, true)
  )[1];
  const deletesCargo = useSelector(state =>
    selectOrigin(state.bill, 'deletes', { actId, cargoId }, true)
  )[1];
  const [openPlaceDetails, setOpenPlaceDetails] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const detailsDropdown = useRef(null);
  useOutsideClick(detailsDropdown, () => setOpenPlaceDetails(false));
  const isInAdds = !!addsCargo?.place_id_list?.includes(place_id);
  const isInDeletes = !!deletesCargo?.place_id_list?.includes(place_id);

  const isChecked = useMemo(() => {
    if (is_added && isInDeletes) {
      return false;
    }

    if (!is_added && !isInAdds) {
      return false;
    }

    if (isInAdds) return true;

    return is_added;
  }, [isInAdds, isInDeletes]);

  const onChange = () => {
    if (!isChecked) {
      if (is_added && isInDeletes) {
        dispatch(
          removePlaceFromList({
            actId,
            cargoId,
            id: place_id,
            type: 'deletes',
            isExtra: true,
          })
        );
        return;
      }
      if (!isInAdds) {
        dispatch(
          setPlaceToList({
            actId,
            cargoId,
            id: place_id,
            type: 'adds',
            isExtra: true,
          })
        );
        return;
      }
    }
    if (isInAdds) {
      dispatch(
        removePlaceFromList({
          actId,
          cargoId,
          id: place_id,
          type: 'adds',
          isExtra: true,
        })
      );
      return;
    }
    if (is_added) {
      dispatch(
        setPlaceToList({
          actId,
          cargoId,
          id: place_id,
          type: 'deletes',
          isExtra: true,
        })
      );
    }
  };

  return (
    <tr style={{ fontSize: 12 }}>
      <td style={{ position: 'relative' }}>
        {openPlaceDetails && (
          <div className={style.cardStatusGrid} ref={detailsDropdown}>
            <div>
              <p>{t('placeIsExtraOnLoadingList', { name: loading_list })}</p>
              <p>{t('goingToWarehouse', { name: next_warehouse.name })}</p>
            </div>
          </div>
        )}
        <div className={s.textFlex}>
          <Checkbox
            checked={isChecked}
            variant="fill"
            size="big"
            containerStyle={{ marginRight: 16 }}
            onChange={onChange}
          />
          <div
            className={s.textFlex}
            style={{ cursor: 'pointer', color: '#0B6BE6' }}
            onClick={() => setOpenPlaceDetails(true)}
          >
            <span>
              {t('seat')} #{place_id}
            </span>
          </div>
        </div>
      </td>
      <td className={s.text}>{goods_type?.name}</td>
      <td>
        <div className={s.textFlex}>
          <span>{tnved?.code}</span>
          <span style={{ color: '#828282', marginLeft: 4 }}>{tnved?.name}</span>
        </div>
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
      <td className={s.text}>
        {tariff} {unit_of_measure === 'm3' ? t('forCubicMeter') : t('forKg')}
      </td>
      <td className={s.text}>
        {cost} {currency?.symbol}
      </td>
    </tr>
  );
}
