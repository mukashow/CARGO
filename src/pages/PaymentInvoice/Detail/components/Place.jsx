import s from '@pages/LoadingListDetail/index.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { uppercase } from '@/helpers';
import {
  deletePlaceFromAddsMemory,
  deletePlaceFromAddsRemovalMemory,
  deletePlaceFromDeletesMemory,
  deletePlaceFromDeletesRemovalMemory,
  setIsPlaceInList,
  setPlaceToAddsMemory,
  setPlaceToAddsRemovalMemory,
  setPlaceToDeletesMemory,
  setPlaceToDeletesRemovalMemory,
} from '@slices/bill';
import clsx from 'clsx';
import { Checkbox, Icon } from '@components';
import { useOutsideClick } from '@hooks';

export const Place = React.memo(
  ({
    place_id,
    weight,
    volume,
    pieces,
    places,
    confiscated,
    loaded,
    lost,
    unloaded,
    extra,
    found,
    is_added,
    isChecked,
    isInAdds,
    isInAddsMemory,
    isInRemovalAddsMemory,
    isInDeletesMemory,
    isInDeletes,
    isInDeletesRemovalMemory,
  }) => {
    const { t } = useTranslation();
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentHeightExceeded, setCommentHeightExceeded] = useState(false);
    const adds = useSelector(state => state.bill.places.adds);
    const deletes = useSelector(state => state.bill.places.deletes);
    const reasonDropdown = useRef(null);
    useOutsideClick(reasonDropdown, () => setCommentOpen(false));
    const dispatch = useDispatch();

    const onChange = () => {
      if (!isChecked) {
        if (isInAdds && isInRemovalAddsMemory) {
          dispatch(deletePlaceFromAddsRemovalMemory({ id: place_id, isExtra: extra.isExtra }));
          return;
        }
        if (!is_added) {
          dispatch(setPlaceToAddsMemory({ id: place_id, isExtra: extra.isExtra }));
          return;
        }
        if (isInDeletesMemory) {
          dispatch(deletePlaceFromDeletesMemory({ id: place_id, isExtra: extra.isExtra }));
          return;
        }
        if (isInDeletes) {
          dispatch(setPlaceToDeletesRemovalMemory({ id: place_id, isExtra: extra.isExtra }));
        }
        return;
      }
      if (isInDeletes && isInDeletesRemovalMemory) {
        dispatch(deletePlaceFromDeletesRemovalMemory({ id: place_id, isExtra: extra.isExtra }));
        return;
      }
      if (is_added) {
        dispatch(setPlaceToDeletesMemory({ id: place_id, isExtra: extra.isExtra }));
        return;
      }
      if (isInAdds) {
        dispatch(setPlaceToAddsRemovalMemory({ id: place_id, isExtra: extra.isExtra }));
        return;
      }
      if (isInAddsMemory) {
        dispatch(deletePlaceFromAddsMemory({ id: place_id, isExtra: extra.isExtra }));
      }
    };

    useEffect(() => {
      dispatch(
        setIsPlaceInList({
          id: place_id,
          actId: places.actId,
          cargoId: places.cargoId,
          isExtra: extra.isExtra,
        })
      );
    }, [adds, deletes]);

    return (
      <div className={s.card}>
        <div>
          <div className={s.cardTitle}>
            <h3>
              {uppercase(t('seat'))} #{place_id}
            </h3>
          </div>
          <div className={s.tags}>
            <div className={s.tag}>
              {weight} {t('weightKg')}
            </div>
            <div className={s.tag}>
              {volume} {t('cubicMeter')}
            </div>
            <div className={s.tag}>
              {Number(pieces)} {t('piecesShort')}
            </div>
          </div>
        </div>
        <div className={s.cardStatusGrid}>
          {places?.can_show_loading_place_info && !loaded?.is_loaded && (
            <span className={s.red}>*{t('placeNotLoaded')}!</span>
          )}
          {places?.can_show_unloading_place_info && !unloaded?.is_unloaded && (
            <span className={s.red}> *{t('placeNotUnloaded')}!</span>
          )}
          {lost?.is_lost && (
            <div>
              <p className={s.red}>*{t('placeLost')}!</p>
              {lost.lost_in_loading_list && (
                <p>{t('placeLostOnLoadingList', { name: lost.lost_in_loading_list })}</p>
              )}
              {lost.lost_in_warehouse?.name && (
                <p>{t('placeOnWarehouse', { name: lost.lost_in_warehouse.name })}</p>
              )}
            </div>
          )}
          {found.is_found && (
            <div>
              <p className={s.red}>*{t('placeFound')}!</p>
              {found.found_in_loading_list && (
                <p>{t('placeIsExtraOnLoadingList', { name: found.found_in_loading_list })}</p>
              )}
              {found.actual_warehouse?.name && (
                <p>{t('inThatWarehouse', { name: found.actual_warehouse.name })}</p>
              )}
              {found.next_warehouse?.name && (
                <p>{t('goingToWarehouse', { name: found.next_warehouse.name })}</p>
              )}
            </div>
          )}
          {confiscated?.is_confiscated && (
            <div style={{ position: 'relative' }}>
              <p className={s.red}>*{t('placeConfiscated')}</p>
              {confiscated.loading_list && (
                <p>{t('placeConfiscatedOnLoadingList', { name: confiscated.loading_list })}</p>
              )}
              <p>
                {t('confiscatedBy').toLowerCase()}: {confiscated.worker_name || ''}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <p
                  ref={el => setCommentHeightExceeded(el?.scrollHeight > 67)}
                  className={clsx(s.confiscateReason)}
                >
                  {t('reason').toLowerCase()}:{' '}
                  {confiscated.comment ??
                    (!confiscated.worker_name ? t('automaticallyConfiscated') : '')}
                </p>
                {commentHeightExceeded && (
                  <span className={s.toggle} onClick={() => setCommentOpen(!commentOpen)}>
                    {t('readMoreText')}
                  </span>
                )}
                {commentOpen && (
                  <div ref={reasonDropdown} className={s.confiscatedReasonDropdown}>
                    <p className={s.value} style={{ maxWidth: 'none' }}>
                      {confiscated.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {extra.is_extra && (
            <div>
              <p className={s.red}>*{t('placeIsExtra')}!</p>
              {extra.loading_list && (
                <p>{t('placeShouldBeOnLoadingList', { name: extra.loading_list })}</p>
              )}
              {extra.actual_warehouse?.name && (
                <p>{t('inThatWarehouse', { name: extra.actual_warehouse.name })}</p>
              )}
              {extra.next_warehouse?.name && (
                <p>{t('goingToWarehouse', { name: extra.next_warehouse.name })}</p>
              )}
              {extra.destination_warehouse?.name && (
                <p>{t('finalWarehouse', { name: extra.destination_warehouse.name })}</p>
              )}
            </div>
          )}
        </div>
        {found.is_in_warehouse ? (
          <>
            <a data-tip data-for={`place-${place_id}`}>
              <Icon iconId="alert" color="#FFC8D1" />
            </a>
            <ReactTooltip id={`place-${place_id}`}>
              <span>{t('placeCantBeSelected')}</span>
            </ReactTooltip>
          </>
        ) : (
          <Checkbox size="big" variant="fill" checked={isChecked} onChange={onChange} />
        )}
      </div>
    );
  }
);
