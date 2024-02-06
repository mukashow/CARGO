import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createRoutePointLimitation,
  fetchDocTypeRule,
  fetchDocTypes,
  fetchFilterRoutes,
  fetchRouteDetail,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateLimitationByWaypoint = ErrorBoundaryHoc(
  ({ isOpen, close, rule, expandedRowId }) => {
    const { routes, route } = useSelector(state => ({
      routes: state.point.routesFilter,
      route: state.point.route,
    }));
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      route: yup.object().required(t('fieldShouldBeFilled')).nullable(),
      point: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      reset,
      control,
      handleSubmit,
      setError,
      setValue,
    } = useForm({ defaultValues: { route: null, point: null }, resolver });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(createRoutePointLimitation({ ...values, rule })).unwrap();
        await dispatch(fetchDocTypes(searchParams));
        await dispatch(fetchDocTypeRule(expandedRowId));
        reset();
        close();
      } catch (errors) {
        for (const key in errors) {
          setError(key, { message: errors[key] });
        }
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (isOpen) {
        dispatch(fetchFilterRoutes());
      }
    }, [isOpen]);

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelConfirm(true)}
        title={t('limitation')}
        contentStyle={{ width: 422 }}
      >
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            labelText={`${t('limitationBy')}`}
            placeholder={t('byLoadingListRoutePoint')}
            disabled
            lined
          />
          <SelectCustom
            options={routes}
            getOptionLabel={option => option.name}
            getOptionValue={option => option.id}
            name="route"
            labelText={`${t('route')}:`}
            error={errors.route?.message}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            control={control}
            placeholder={t('selectRequired')}
            onChange={({ id }) => {
              dispatch(fetchRouteDetail(id));
              setValue('point', null);
            }}
          />
          <SelectCustom
            name="point"
            labelText={`${t('point').toLowerCase()}:`}
            error={errors.point?.message}
            control={control}
            placeholder={t('selectRequired')}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            getOptionLabel={option => option.name}
            getOptionValue={option => option.id}
            options={route?.points}
          />
          <div className={s.footer}>
            <Button
              onClick={() => setCancelConfirm(true)}
              textButton
              value={t('modalConfirmLabelCancel')}
              style={{ fontSize: 16 }}
            />
            <Button value={t('modalConfirmLabelConfirm')} isBlue type="button" disabled={loading} />
          </div>
        </form>
        <ModalAction
          title={t('toCancelLimitationCreationByWaypoint')}
          description={t('limitationDataWillNotBeSaved')}
          isOpen={cancelConfirm || backModalOpen}
          onCancel={() => {
            setCancelConfirm(false);
            onCancel();
          }}
          onSubmit={() => {
            setCancelConfirm(false);
            backConfirm();
            reset();
            close();
          }}
        />
      </Modal>
    );
  }
);
