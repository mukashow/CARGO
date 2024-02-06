import mainStyle from '../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchLoadingListPlaces } from '@/store/actions';
import clsx from 'clsx';
import { ErrorBoundaryHoc, Icon, Input, Table } from '@/components';
import { useOutsideClick } from '@/hooks';

export const GoodsTable = ErrorBoundaryHoc(
  ({ goods, status, setDecodingCargoOpen, fetchPlaces }) => {
    const loadingList = useSelector(state => state.loadingList.loadingListDetail);
    const { roleId, hasStorekeeperPermission } = useSelector(state => ({
      roleId: state.auth.user.role_id,
      hasStorekeeperPermission: state.auth.user.has_storekeeper_permissions,
    }));
    const { scannedPlaces, unloadingGoods } = useSelector(state => ({
      scannedPlaces: state.loadingList.scannedPlaces,
      unloadingGoods: state.loadingList.unloadingGoods,
    }));

    const HEAD_ROW = useMemo(() => {
      const data = [
        'receiverCodeFilter',
        'goodsTypeFilter',
        'tnVedCode',
        'seatsNumber',
        'weight',
        'volume',
        { title: 'cargoDensity', icon: 'density', tooltip: 'densityFormula' },
        'tableDocComment',
        'pieces',
        'note',
        'tableDocAction',
      ];
      if (roleId === 5) return data;
      if (roleId !== 1 || loadingList?.status === 7 || loadingList?.status === 12) {
        return data.filter(key => key.title !== 'cargoDensity');
      }
      return data;
    }, [loadingList]);

    const HEAD_ROW_SCANNED = useMemo(() => {
      const headRow = HEAD_ROW.filter(th => th !== 'tableDocAction' && th !== 'pieces');
      return [...headRow, 'scanned'];
    }, [HEAD_ROW]);

    const row = useMemo(() => {
      const isSuitableRole = roleId === 2 || hasStorekeeperPermission;

      if (isSuitableRole && status === 7) {
        return scannedPlaces?.goods_type_list;
      }
      if (isSuitableRole && status === 12 && loadingList?.can_unload_places) {
        return unloadingGoods?.goods_list;
      }
      return goods;
    }, [loadingList, goods, unloadingGoods, status, scannedPlaces]);

    const showScannedPlaces =
      (status === 7 || (status === 12 && loadingList?.can_unload_places)) &&
      (roleId === 2 || hasStorekeeperPermission);
    const headRow = showScannedPlaces ? HEAD_ROW_SCANNED : HEAD_ROW;

    return (
      <>
        <Table
          headRow={
            goods?.some(({ comment }) => !!comment)
              ? headRow
              : headRow.filter(name => name !== 'tableDocComment')
          }
          row={row}
          rowProps={{
            setDecodingCargoOpen,
            hasSomeComment: goods?.some(({ comment }) => !!comment),
            status,
            fetchPlaces,
            showScannedPlaces,
          }}
          RowComponent={Row}
          withBorder
          className={mainStyle.goodsTable}
        />
      </>
    );
  }
);

const Row = ErrorBoundaryHoc(
  ({
    item: {
      receiver_code,
      goods_type_name,
      tnved,
      receiver,
      place_count,
      weight,
      volume,
      pieces,
      tags,
      comment,
      unloaded_place_count,
      scanned_place_count,
      cargo_density,
    },
    setDecodingCargoOpen,
    hasSomeComment,
    status,
    fetchPlaces,
    showScannedPlaces,
  }) => {
    const loadingList = useSelector(state => state.loadingList.loadingListDetail);
    const { roleId, hasStorekeeperPermission } = useSelector(state => ({
      roleId: state.auth.user.role_id,
      hasStorekeeperPermission: state.auth.user.has_storekeeper_permissions,
    }));
    const [actionOpen, setActionOpen] = useState(false);
    const [isCommentExceeded, setIsCommentExceeded] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const dispatch = useDispatch();
    const { loadingListId } = useParams();
    const { t } = useTranslation();
    const ref = useRef(null);
    const commentRef = useRef(null);
    useOutsideClick([commentRef, ref], () => {
      setActionOpen(false);
      setCommentOpen(false);
    });

    const showAction = () => {
      if (roleId === 3) return false;

      if (hasStorekeeperPermission || roleId === 2) {
        return !(status === 7 || (status === 12 && loadingList?.can_unload_places));
      }
      return true;
    };

    const fetchPlacesAsync = () => {
      dispatch(fetchLoadingListPlaces({ loadingListId, tnved: tnved.id, receiver }));
      fetchPlaces.current = () =>
        dispatch(fetchLoadingListPlaces({ loadingListId, tnved: tnved.id, receiver }));
    };

    useEffect(() => {
      setIsCommentExceeded(comment && comment.slice(0, 100).length < comment.length);
    }, [comment]);

    return (
      <tr>
        <td>
          <span className={s.text}>{receiver_code}</span>
        </td>
        <td>
          <span className={s.text}>{goods_type_name}</span>
        </td>
        <td>
          <p className={s.text}>{tnved?.code}</p>
          <p className={s.text} style={{ color: '#828282' }}>
            {tnved?.name}
          </p>
        </td>
        <td>
          <span className={s.text}>{place_count}</span>
        </td>
        <td>
          <span className={s.text}>
            {weight} {t('weightKg')}
          </span>
        </td>
        <td>
          <span className={s.text}>
            {volume} {t('cubicMeter')}
          </span>
        </td>
        {roleId === 5 ? (
          <td className={s.text}>{cargo_density} ρ</td>
        ) : (
          roleId === 1 &&
          status !== 7 &&
          status !== 12 && <td className={s.text}>{cargo_density} ρ</td>
        )}
        {hasSomeComment && (
          <td style={{ minWidth: 250 }}>
            <div ref={commentRef} className={clsx(s.comment, s.text, commentOpen && s.open)}>
              {isCommentExceeded ? comment?.slice(0, 100) + '...' : comment}
              {isCommentExceeded && (
                <p className={s.moreBtn} onClick={() => setCommentOpen(true)}>
                  {t('readMore')}
                </p>
              )}
              <p className={clsx(s.commentFull)}>{comment}</p>
            </div>
          </td>
        )}
        {showScannedPlaces && (
          <td>
            <span className={s.text}>{tags.map(({ name }) => name).join(', ')}</span>
          </td>
        )}
        <td style={{ width: 250 }}>
          {showScannedPlaces ? (
            <div className={s.textFlex}>
              <Input
                containerStyle={{ maxWidth: 188, width: '100%', minWidth: 100 }}
                small
                style={{
                  height: 28,
                  fontSize: 12,
                  borderColor:
                    (unloaded_place_count ?? scanned_place_count) === place_count
                      ? '#009E61'
                      : '#DF3B57',
                  color:
                    (unloaded_place_count ?? scanned_place_count) === place_count
                      ? 'black'
                      : '#828282',
                  background: 'white',
                }}
                value={`${unloaded_place_count ?? scanned_place_count}/${place_count} ${t(
                  'seats'
                )}`}
                disabled
              />
              <Icon
                iconId="menuList"
                color="#0B6BE6"
                clickable
                style={{ marginLeft: 24 }}
                onClick={() => {
                  setDecodingCargoOpen(true);
                  fetchPlacesAsync();
                }}
              />
            </div>
          ) : (
            <span className={s.text}>{pieces}</span>
          )}
        </td>
        {!showScannedPlaces && (
          <td>
            <span className={s.text}>{tags.map(({ name }) => name).join(', ')}</span>
          </td>
        )}
        {showAction() && (
          <td style={{ position: 'relative' }}>
            <div className={s.actionWrap}>
              <div ref={ref}>
                <Icon
                  iconClass={s.actionIcon}
                  iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                  onClick={() => setActionOpen(!actionOpen)}
                  clickable
                />
                {actionOpen && (
                  <div className={s.actionDropdown}>
                    <div
                      className={s.actionDropdownButton}
                      onClick={() => {
                        setDecodingCargoOpen(true);
                        fetchPlacesAsync();
                      }}
                    >
                      <Icon iconId="menuList" color="#0B6BE6" />
                      <span>{t('decodingCargo')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        )}
      </tr>
    );
  }
);
