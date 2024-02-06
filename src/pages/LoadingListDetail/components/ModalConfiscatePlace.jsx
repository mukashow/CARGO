import s from '../index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import { confiscatePlace, fetchLoadingListPlaces } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal } from '@/components';
import { useYupValidationResolver } from '@/hooks';

export const ModalConfiscatePlace = ErrorBoundaryHoc(
  ({ isOpen, close, place, tnved, receiver }) => {
    const loadingList = useSelector(state => state.loadingList.loadingListDetail);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { loadingListId } = useParams();

    const validationSchema = yup.object({
      comment: yup.string().max(500, `${t('maxCharactersLength')} 500`),
    });
    const resolver = useYupValidationResolver(validationSchema);
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm({ defaultValues: { comment: '' }, resolver });

    const onSubmit = ({ comment }) => {
      setLoading(true);
      dispatch(confiscatePlace({ loadingListId, comment, place }))
        .then(() => {
          dispatch(fetchLoadingListPlaces({ loadingListId, tnved: tnved.id, receiver }));
          reset();
          close();
        })
        .finally(() => setLoading(false));
    };

    return (
      <Modal
        isOpen={isOpen}
        close={close}
        title={`${uppercase(t('seat'))} ${place || ''}`}
        contentStyle={{ maxWidth: 422 }}
      >
        {loadingList?.status === 13 && (
          <p className={s.confiscateModalDesc}>{t('confiscateModalDescription')}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={s.inputs}>
            <Input
              register={register}
              multiline
              style={{ minHeight: 110, color: '#232323' }}
              name="comment"
              labelText={`${t('reason').toLowerCase()}:`}
              placeholder={t('enterValueOptional')}
              errors={errors.comment?.message}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: window.innerWidth > 1440 ? 40 : 24,
            }}
          >
            <Button textButton value={t('modalConfirmLabelCancel')} onClick={close} />
            <Button type="button" isBlue value={t('modalConfirmLabelConfirm')} disabled={loading} />
          </div>
        </form>
      </Modal>
    );
  }
);
