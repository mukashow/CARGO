import s from './index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import { PlaceAddForm } from '@pages/ActAcceptanceDetail/Storekeeper/components';
import { ErrorBoundaryHoc, Icon, Modal, ModalAction } from '@/components';
import { deletePlace } from '@actions/goods';

export const ModalDecipheringPlaces = ErrorBoundaryHoc(({ isOpen, close, placesByTnved }) => {
  const goodsDetail = useSelector(state => state.goods.goodsDetail);
  const { hasStorekeeperPermissions, roleId } = useSelector(state => ({
    hasStorekeeperPermissions: state.auth.user.has_storekeeper_permissions,
    roleId: state.auth.user.role_id,
  }));
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [editCancelModal, setEditCancelModal] = useState(false);
  const [placeId, setPlaceId] = useState(null);
  const [loading, setLoading] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { actId } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isEditDisabled = useMemo(() => {
    if (!goodsDetail) return true;
    if (roleId === 2) {
      return goodsDetail.status !== 1 && goodsDetail.status !== 2;
    }
    return goodsDetail.status_id !== 1 && goodsDetail.status_id !== 2 && hasStorekeeperPermissions;
  }, [goodsDetail]);

  const onConfirmDelete = () => {
    setLoading(true);
    dispatch(deletePlace({ id: placeId, actId, close }))
      .unwrap()
      .finally(() => {
        setLoading(false);
        setDeleteConfirmModal(false);
      });
  };

  useEffect(() => {
    if (!isOpen) setEditMode(false);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      close={editMode ? () => setEditCancelModal(true) : close}
      contentStyle={{ maxWidth: 804, width: '100%', paddingBottom: 30 }}
      overflow="visible"
    >
      <table className={clsx(s.table, tableStyle.raw)}>
        <thead>
          <tr style={{ height: 'auto' }}>
            <th>{t('goodsType')}</th>
            <th>{t('seatNumber')}</th>
            <th>{t('weight')}</th>
            <th>{t('volume')}</th>
            <th>{t('pieces')}</th>
            <th>{t('tableDocAction')}</th>
          </tr>
        </thead>
        <tbody>
          {placesByTnved?.place_list.map(({ id, weight, volume, pieces }, index) => (
            <React.Fragment key={id}>
              <tr>
                {index === 0 ? (
                  <td style={{ position: 'relative' }}>{placesByTnved.goods_type_name}</td>
                ) : index === 1 ? (
                  <td style={{ position: 'relative' }}>
                    <span className={s.th}>{t('tnVedCode')}</span>
                    <span>{placesByTnved.tnved_code}</span>
                    <span>{placesByTnved?.tnved_name}</span>
                  </td>
                ) : (
                  <td />
                )}
                <td>#{id}</td>
                <td>
                  {weight} {t('weightKg')}
                </td>
                <td>
                  {volume} {t('cubicMeter')}
                </td>
                <td>{pieces}</td>
                <td>
                  <Icon
                    iconId="edit"
                    color="#0B6BE6"
                    iconWidth={16}
                    iconHeight={16}
                    iconClass={s.icon}
                    clickable
                    disabled={isEditDisabled}
                    onClick={() => {
                      setEditMode(true);
                      setPlaceId(id);
                    }}
                  />
                  <Icon
                    iconId="trash"
                    color="#DF3B57"
                    iconWidth={16}
                    iconHeight={16}
                    clickable
                    disabled={isEditDisabled}
                    onClick={() => {
                      setDeleteConfirmModal(true);
                      setEditMode(false);
                      setPlaceId(id);
                    }}
                  />
                </td>
              </tr>
            </React.Fragment>
          ))}
          {placesByTnved?.place_list.length === 1 && (
            <tr>
              <td style={{ position: 'relative' }}>
                <span className={s.th}>{t('tnVedCode')}</span>
                <span>{placesByTnved.tnved_code}</span>
                <span>{placesByTnved?.tnved_name}</span>
              </td>
            </tr>
          )}
          <tr className={s.total} data-islessrow={placesByTnved?.place_list.length <= 2}>
            <td>{t('tableClientTotal')}</td>
            <td>
              {placesByTnved?.total.place_count} {t('seats')}
            </td>
            <td>
              {placesByTnved?.total.weight} {t('weightKg')}
            </td>
            <td>
              {placesByTnved?.total.volume} {t('cubicMeter')}
            </td>
            <td>{placesByTnved?.total.pieces}</td>
          </tr>
        </tbody>
      </table>
      <ModalAction
        isOpen={deleteConfirmModal}
        title={t('toDeletePlace')}
        description={t('toDeletePlaceDescription')}
        onCancel={() => setDeleteConfirmModal(false)}
        onSubmit={onConfirmDelete}
        submitButtonDisabled={loading}
      />
      <ModalAction
        isOpen={editCancelModal}
        title={t('confirmCancelAction')}
        onCancel={() => setEditCancelModal(false)}
        onSubmit={() => {
          setEditCancelModal(false);
          close();
        }}
      />
      {editMode && (
        <PlaceAddForm
          isEditMode
          placeId={placeId}
          setEditMode={setEditMode}
          defaultValues={{
            id_goods_type: {
              label: placesByTnved.goods_type_name,
              value: placesByTnved.goods_type_id,
              tnved_list: [{ code: placesByTnved.tnved_code, id: placesByTnved.tnved_id }],
            },
            id_tnved: { label: placesByTnved.tnved_code, value: placesByTnved.tnved_id },
            weight: String(placesByTnved.place_list.find(({ id }) => placeId === id).weight),
            volume: String(placesByTnved.place_list.find(({ id }) => placeId === id).volume),
            pieces: String(placesByTnved.place_list.find(({ id }) => placeId === id).pieces),
          }}
        />
      )}
    </Modal>
  );
});
