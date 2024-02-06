import s from '../index.module.scss';
import inputStyle from '@/components/Forms/Input/index.module.scss';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  cancelScan,
  cancelUnloadingPlace,
  fetchGoodsForUnloading,
  fetchLoadingListInfo,
  fetchLoadingListPlaces,
  fetchScannedPlaces,
  scanLoadingListPlace,
  unloadPlace,
} from '@/store/actions';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { Button, ErrorBoundaryHoc, Icon, Input } from '@/components';

const DISABLED_INPUT_STYLE = { border: 'none', color: '#0B6BE6', background: 'white' };

export const PlaceAddOrUnload = ErrorBoundaryHoc(({ setDecodingCargoOpen, status }) => {
  const { scannedPlaces, unloadingGoods } = useSelector(state => ({
    scannedPlaces: state.loadingList.scannedPlaces,
    unloadingGoods: state.loadingList.unloadingGoods,
  }));
  const [placeId, setPlaceId] = useState('');
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCanceled, setLoadingCanceled] = useState(false);
  const { loadingListId } = useParams();
  const { t, i18n } = useTranslation();
  const lastScannedPlaceId = useRef('');
  const dispatch = useDispatch();
  const gotId = useRef(false);
  const places = status === 7 ? scannedPlaces?.total : unloadingGoods?.total;

  const placeCanceledTitle = useMemo(() => {
    if (!loadingCanceled) return t('cancelPlace');

    if (i18n.language.match(/ru|ru-RU/)) {
      return `${status === 7 ? 'Погрузка' : 'Разгрузка'} места #${
        lastScannedPlaceId.current
      } отменена`;
    }
    if (i18n.language.match(/en|en-US/)) {
      return `${status === 7 ? 'Loading' : 'Unloading'} place #${
        lastScannedPlaceId.current
      } cancelled`;
    }
    return status === 7
      ? `${lastScannedPlaceId.current}号装载地点已被取消`
      : `${lastScannedPlaceId.current}号座位的卸货已被取消`;
  }, [loadingCanceled, status]);

  const onPlaceIdChange = e => {
    const symbol = window.navigator.userAgent.indexOf('Mac OS') !== -1 ? '0010' : 'w';

    if (e.target.value.includes(symbol)) {
      gotId.current = true;
      setPlaceId(e.target.value.replace(symbol, ''));
      setTimeout(() => {
        gotId.current = false;
      }, 1000);
      return;
    }
    if (!gotId.current) {
      setPlaceId(e.target.value);
    }
  };

  const onSubmit = async placeId => {
    if (placeId) {
      setPlace(null);
      setLoading(true);
      try {
        const place = await dispatch(
          status === 7
            ? scanLoadingListPlace({ id: placeId, loadingListId })
            : unloadPlace({ loadingListId, placeId })
        ).unwrap();
        if (status === 7) {
          dispatch(fetchScannedPlaces(loadingListId));
        } else {
          dispatch(fetchGoodsForUnloading(loadingListId));
        }
        setPlace(place);
        setPlaceId('');
        lastScannedPlaceId.current = placeId;
        dispatch(fetchLoadingListInfo({ id: loadingListId }));
      } catch (e) {
        lastScannedPlaceId.current = '';
      } finally {
        setLoading(false);
      }
    }
  };

  const onCancelScan = async () => {
    setLoading(true);
    try {
      await dispatch(
        status === 7
          ? cancelScan({ placeId: lastScannedPlaceId.current, loadingListId })
          : cancelUnloadingPlace({ loadingListId, placeId: lastScannedPlaceId.current })
      );
      if (status === 7) {
        dispatch(fetchScannedPlaces(loadingListId));
      } else {
        dispatch(fetchGoodsForUnloading(loadingListId));
      }
      setPlace(null);
      setLoadingCanceled(true);
    } finally {
      setLoading(false);
    }
  };
  const debounceFn = useCallback(debounce(onSubmit, 500), [status]);

  useEffect(() => {
    debounceFn(placeId);
  }, [placeId]);

  return (
    <form className={s.placeAdd} onSubmit={onSubmit}>
      <div className={s.scan}>
        <Icon iconId="scan" iconWidth={50} iconHeight={50} />
        <p>{t(status === 7 ? 'startLoadingPlace' : 'startUnloadingPlace')}</p>
      </div>
      <div className={s.right}>
        <div className={s.fields}>
          <Input
            type="text"
            value={placeId}
            onChange={onPlaceIdChange}
            labelText={t('seatNumber')}
            small
            thinLabel
            labelSmall
            onFocus={() => setLoadingCanceled(false)}
          />
          <Input
            value={place?.receiver_code || ''}
            labelText={t('clientCodeClient')}
            small
            thinLabel
            labelSmall
            style={DISABLED_INPUT_STYLE}
            disabled
          />
          <Input
            value={place?.goods_type_name || ''}
            labelText={t('goodsTypeFilter')}
            small
            thinLabel
            labelSmall
            style={DISABLED_INPUT_STYLE}
            disabled
          />
          <div>
            <p className={clsx(inputStyle.labelText, inputStyle.small, inputStyle.thin)}>
              {t('tnVed')}
            </p>
            <div
              className={clsx(inputStyle.input, inputStyle.small)}
              aria-disabled
              style={{
                ...DISABLED_INPUT_STYLE,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <p>{place?.tnved?.code || ''}</p>
              <span className={s.overflowEllipsis} style={{ color: '#828282', marginLeft: 6 }}>
                {place?.tnved?.name || ''}
              </span>
            </div>
          </div>
          <Input
            value={
              place
                ? `${
                    place.scanned_place_count ??
                    place.total_by_receiver_and_tnved.unloaded_places_count
                  }/${place.place_count ?? place.total_by_receiver_and_tnved.places_count}`
                : ''
            }
            labelText={t('seats')}
            small
            thinLabel
            labelSmall
            style={DISABLED_INPUT_STYLE}
            disabled
            iconId={place ? 'menuList' : null}
            iconColor="#0B6BE6"
            iconClick={() => {
              setDecodingCargoOpen(true);
              dispatch(
                fetchLoadingListPlaces({
                  loadingListId,
                  tnved: place.tnved.id,
                  receiver: place.receiver_id,
                })
              );
            }}
          />
        </div>
        <div className={s.footer}>
          <Button
            value={placeCanceledTitle}
            isSmall
            red
            disabled={!lastScannedPlaceId.current || loading}
            onClick={onCancelScan}
            {...(loadingCanceled && { style: { background: '#FFC8D1' } })}
          />
          {places ? (
            <>
              {'confiscated_place_count' in places && (
                <p>
                  {t('confiscated')} <span>{places.confiscated_place_count}</span>
                </p>
              )}
              <p style={{ marginLeft: 'confiscated_place_count' in places ? 40 : 'auto' }}>
                {t('totalPlace')}{' '}
                <span>
                  {places.unloaded_place_count ?? places.scanned_place_count}/{places.place_count}
                </span>
              </p>
            </>
          ) : null}
        </div>
      </div>
    </form>
  );
});
