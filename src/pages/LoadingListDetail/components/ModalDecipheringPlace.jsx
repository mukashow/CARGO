import s from '../index.module.scss';
import tableStyle from '@/components/Table/index.module.scss';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import { markPlaceFound } from '@/store/actions';
import clsx from 'clsx';
import { ModalConfiscatePlace } from '@pages/LoadingListDetail/components/ModalConfiscatePlace';
import { ErrorBoundaryHoc, Icon, Modal, ModalAction } from '@/components';
import { useOutsideClick } from '@/hooks';

const Place = ErrorBoundaryHoc(
  ({
    place_id,
    weight,
    volume,
    pieces,
    can_confiscate,
    can_mark_found,
    roleId,
    places,
    setConfiscatedPlaceId,
    setPlaceFoundId,
    confiscated,
    loaded,
    lost,
    unloaded,
    extra,
    found,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const ref = useRef(null);
    const { t } = useTranslation();
    const [mouseOnDropdown, setMouseOnDropdown] = useState(false);
    const [mouseOnDropdownWrap, setMouseOnDropdownWrap] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentHeightExceeded, setCommentHeightExceeded] = useState(false);
    const reasonDropdown = useRef(null);
    useOutsideClick(reasonDropdown, () => setCommentOpen(false));
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <div className={s.card}>
        <div>
          <div className={s.cardTitle}>
            <Icon
              iconId="alert-circle"
              color="#BDBDBD"
              iconWidth={18}
              iconHeight={18}
              style={{ transform: 'rotate(180deg)' }}
              onMouseEnter={() => {
                setDropdownOpen(true);
                setMouseOnDropdownWrap(true);
              }}
              onMouseLeave={() => {
                setDropdownOpen(mouseOnDropdown);
                setMouseOnDropdownWrap(false);
              }}
            />
            <h3>
              {uppercase(t('seat'))} #{place_id}
            </h3>
            {dropdownOpen && (
              <div
                className={s.dropdown}
                onMouseEnter={() => {
                  setDropdownOpen(true);
                  setMouseOnDropdown(true);
                }}
                onMouseLeave={() => {
                  setDropdownOpen(mouseOnDropdownWrap);
                  setMouseOnDropdown(false);
                }}
              >
                <h3>
                  {uppercase(t('seat'))} #{place_id}
                </h3>
                <div>
                  <span>{t('loadedHuman')}: </span>
                  <p>{loaded.worker_name}</p>
                </div>
                <div>
                  <span>{t('unloadedHuman')}: </span>
                  <p>{unloaded.worker_name}</p>
                </div>
                <div></div>
              </div>
            )}
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
        {(can_confiscate || can_mark_found) && (
          <div ref={ref} style={{ position: 'relative', height: 20 }}>
            <Icon
              iconClass={tableStyle.actionIcon}
              iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
              onClick={() => setActionOpen(!actionOpen)}
              clickable
              iconWidth={20}
              iconHeight={20}
              style={{ padding: 0, margin: 0 }}
            />
            {actionOpen && (
              <div
                className={tableStyle.actionDropdown}
                style={{ top: '100%', right: 0, width: 'max-content' }}
              >
                {can_confiscate && String(roleId).match(/1|4/) && (
                  <div
                    className={tableStyle.actionDropdownButton}
                    onClick={() =>
                      setConfiscatedPlaceId({
                        place: place_id,
                        tnved: places.tnved,
                        receiver: places.receiver,
                      })
                    }
                  >
                    <Icon iconId="none" />
                    <span>{t('confiscatePlace')}</span>
                  </div>
                )}
                {can_mark_found && (
                  <div
                    className={tableStyle.actionDropdownButton}
                    onClick={() => setPlaceFoundId(place_id)}
                  >
                    <Icon iconId="found" />
                    <span>{t('placeFound')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export const ModalDecipheringPlace = ErrorBoundaryHoc(
  ({ isOpen, close, roleId, hasStorekeeperPermission, fetchPlaces }) => {
    const places = useSelector(state => state.loadingList.places);
    const loadingList = useSelector(state => state.loadingList.loadingListDetail);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [confiscatedPlaceId, setConfiscatedPlaceId] = useState(null);
    const { t } = useTranslation();
    const [placeFoundId, setPlaceFoundId] = useState(null);
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentRef, setCommentRef] = useState(null);
    const dropdownRef = useRef(null);
    const reasonDropdown = useRef(null);
    useOutsideClick(dropdownRef, () => setDropdownOpen(false));
    useOutsideClick(reasonDropdown, () => setCommentOpen(false));
    const dispatch = useDispatch();
    const { loadingListId } = useParams();

    const onPlaceFound = async () => {
      await dispatch(markPlaceFound({ loadingListId, placeId: placeFoundId }));
      fetchPlaces.current();
      setPlaceFoundId(null);
    };

    return (
      <Modal
        isOpen={isOpen}
        close={close}
        contentStyle={{
          padding: 0,
          overflow: 'auto',
          maxWidth: 1610,
          minHeight: 520,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className={s.headerWrap}>
          <div className={s.header}>
            <div>
              <h3 className={s.title} style={{ fontSize: 14 }}>
                {t('goodsType')}
              </h3>
              <p className={s.value} style={{ fontSize: 14 }}>
                {places?.goods_type_name}
              </p>
            </div>
            <div>
              <h3 className={s.title} style={{ fontSize: 14 }}>
                {t('tnVed')}
              </h3>
              <p className={s.value} style={{ fontSize: 14 }}>
                {places?.tnved?.code}
              </p>
              <p className={s.value} style={{ fontSize: 14 }}>
                {places?.tnved?.name}
              </p>
            </div>
            <div>
              <h3 className={s.title} style={{ fontSize: 14 }}>
                {t('clientCodeClient')}
              </h3>
              <p className={s.value} style={{ fontSize: 14 }}>
                {places?.receiver_code}
              </p>
            </div>
          </div>
          {places?.confiscated_data.slice(0, 1).map(({ place_count, worker_name, reason }) => (
            <div key={worker_name} className={clsx(s.header, s.right)}>
              <div>
                <p className={s.title} style={{ fontSize: 14, maxWidth: 130 }}>
                  {t('confiscatedPlaces')}
                </p>
                <p className={s.value} style={{ fontSize: 14 }}>
                  {place_count}
                </p>
                {places.confiscated_data.length > 1 && (
                  <div className={s.more} onClick={() => setDropdownOpen(true)}>
                    {t('else')}
                  </div>
                )}
              </div>
              <div>
                <p className={s.title} style={{ fontSize: 14 }}>
                  {t('reason')}
                </p>
                <div style={{ position: 'relative' }}>
                  <p
                    ref={setCommentRef}
                    className={clsx(s.value, s.collapsable)}
                    style={{ fontSize: 14, maxWidth: 'none' }}
                  >
                    {reason}
                  </p>
                  {commentRef?.scrollHeight > 67 && (
                    <span className={s.toggle} onClick={() => setCommentOpen(!commentOpen)}>
                      {t('readMoreText')}
                    </span>
                  )}
                  {commentOpen && (
                    <div className={s.confiscatedReasonDropdown} ref={reasonDropdown}>
                      <p className={s.value} style={{ fontSize: 14, maxWidth: 'none' }}>
                        {reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className={s.title} style={{ fontSize: 14 }}>
                  {t('broker')}
                </p>
                <p className={s.value} style={{ fontSize: 14 }}>
                  {worker_name}
                </p>
              </div>
            </div>
          ))}
          {dropdownOpen && (
            <div ref={dropdownRef} className={s.confiscatedDropdown}>
              {places?.confiscated_data.map(({ place_count, worker_name, reason }, index) => (
                <div key={index}>
                  <hr />
                  <div>
                    <p className={s.title}>{t('confiscatedPlaces')}</p>
                    <p className={s.value}>{place_count}</p>
                  </div>
                  <div>
                    <p className={s.title}>{t('reason')}</p>
                    <p className={s.value}>{reason}</p>
                  </div>
                  <div>
                    <p className={s.title}>{t('broker')}</p>
                    <p className={s.value}>{worker_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={s.places}>
          {places?.place_list.map((item, index) => (
            <Place
              key={index}
              {...item}
              index={index}
              hasStorekeeperPermission={hasStorekeeperPermission}
              roleId={roleId}
              places={places}
              setConfiscatedPlaceId={setConfiscatedPlaceId}
              setPlaceFoundId={setPlaceFoundId}
            />
          ))}
        </div>
        <table className={s.decipheringPlaceModal}>
          <tbody>
            <tr>
              <td>
                <div className={s.footerTags}>
                  <div className={s.dropdownWrap}>
                    <Icon
                      iconId="alert-circle"
                      color="#BDBDBD"
                      iconWidth={18}
                      iconHeight={18}
                      style={{ transform: 'rotate(180deg)' }}
                    />
                    <span>{t('tableClientTotal')}</span>
                    <div className={clsx(s.dropdown, s.total)}>
                      <h3>
                        {t('totalPlaces')}: {places?.total.place_count}
                      </h3>
                      <div>
                        <span>{t('loadedPlaces')}: </span>
                        <p>{places?.total.loaded_place_count}</p>
                      </div>
                      <div>
                        <span>{t('unloadedPlaces')}: </span>
                        <p>{places?.total.unloaded_place_count}</p>
                      </div>
                      <div>
                        <span>{t('confiscatedPlacesInFact').toLowerCase()}:</span>
                        <p>{places?.total.confiscated_place_count}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {places?.total.place_count} {t('seats')}
                  </div>
                  <div>
                    {places?.total.weight || 0} {t('weightKg')}
                  </div>
                  <div>
                    {places?.total.volume || 0} {t('cubicMeter')}
                  </div>
                  <div>
                    {places?.total.pieces || 0} {t('piecesShort')}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <ModalConfiscatePlace
          {...confiscatedPlaceId}
          isOpen={!!confiscatedPlaceId}
          close={() => setConfiscatedPlaceId(null)}
        />
        <ModalAction
          isOpen={!!placeFoundId}
          onCancel={() => setPlaceFoundId(null)}
          {...(loadingList?.status === 13
            ? { title: t('toMarkPlaceAsFound'), description: t('toMarkPlaceAsFoundDescription') }
            : { title: t('toMarkAsFound') })}
          onSubmit={onPlaceFound}
        />
      </Modal>
    );
  }
);
