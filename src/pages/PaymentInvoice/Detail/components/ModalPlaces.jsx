import tableStyle from '@/components/Table/index.module.scss';
import s from '@pages/LoadingListDetail/index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { clearMemories, removePlacesFromList, setMemoryPlacesToList } from '@slices/bill';
import clsx from 'clsx';
import { Button, ErrorBoundaryHoc, Loader, Modal } from '@/components';
import { Place } from './Place';

export const ModalPlaces = ErrorBoundaryHoc(({ isOpen, close, loading }) => {
  const places = useSelector(state => state.bill.placesToAdd);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onConfirm = () => {
    dispatch(setMemoryPlacesToList({ type: 'adds', isExtra: places.is_extra }));
    dispatch(setMemoryPlacesToList({ type: 'deletes', isExtra: places.is_extra }));
    dispatch(removePlacesFromList({ type: 'adds', isExtra: places.is_extra }));
    dispatch(removePlacesFromList({ type: 'deletes', isExtra: places.is_extra }));
    close();
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
      onAfterClose={() => dispatch(clearMemories())}
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={clsx(s.header, s.headerInline)}>
            <div>
              <h3 className={s.title} style={{ fontSize: 14 }}>
                {t('goodsType')}
              </h3>
              <p className={s.value} style={{ fontSize: 14 }}>
                {places?.goods_type.name}
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
          </div>
          <div className={s.places}>
            {places?.place_list.map((item, index) => (
              <Place key={index} {...item} index={index} places={places} />
            ))}
          </div>
          <table className={s.decipheringPlaceModal}>
            <tbody>
              <tr style={{ height: 56 }}>
                <td>
                  <div className={tableStyle.textFlex} style={{ justifyContent: 'space-between' }}>
                    <Button
                      value={t('modalConfirmLabelConfirm')}
                      className={tableStyle.footerButton}
                      isBlue
                      onClick={onConfirm}
                    />
                    <div className={s.footerTags}>
                      <div>{t('tableClientTotal')}</div>
                      <div>
                        {places?.place_count} {t('seats')}
                      </div>
                      <div>
                        {places?.weight || 0} {t('weightKg')}
                      </div>
                      <div>
                        {places?.volume || 0} {t('cubicMeter')}
                      </div>
                      <div>
                        {places?.pieces || 0} {t('piecesShort')}
                      </div>
                      <div>
                        {places?.confiscated_place_count}{' '}
                        {t('confiscatedPlacesInFact').toLowerCase()}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </Modal>
  );
});
