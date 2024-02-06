import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import { fetchLoadingListRoutes } from '@/store/actions';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Modal, ModalAction } from '@/components';
import {
  createRoute,
  fetchFilterRoutes,
  fetchRouteDetail,
  fetchRoutes,
  updateRoute,
} from '@actions/point';
import { useConfirmNavigate } from '@/hooks';
import { PointCard } from './PointCard';

export const ModalCreateEditRoute = ErrorBoundaryHoc(({ isOpen, close, mode = 'create' }) => {
  const route = useSelector(state => state.point.route);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pointsForDelete, setPointsForDelete] = useState([]);
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const schema = yup.object({
    points: yup.array().of(
      yup.object().shape({
        point_id: yup.lazy((_, { from }) => {
          const points = from ? from[1].value.points.filter(({ point_id }) => !!point_id) : [];
          return yup
            .object()
            .nullable()
            .required(
              points.length < 2 ? `${t('minimumPointsCount')} 2` : t('fieldShouldBeFilled')
            );
        }),
      })
    ),
  });
  const resolver = yupResolver(schema);
  const {
    formState: { errors },
    reset,
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    getValues,
  } = useForm({
    defaultValues: {
      points: mode === 'create' ? [{ point_id: null }, { point_id: null }] : [],
    },
    resolver,
  });
  const { insert, remove, move, fields } = useFieldArray({ control, name: 'points' });

  const onSubmit = async ({ points }) => {
    try {
      setLoading(true);
      await dispatch(
        mode === 'create'
          ? createRoute(points)
          : updateRoute({ points, id: route.id, pointsForDelete })
      ).unwrap();
      await dispatch(fetchRoutes(searchParams));
      dispatch(fetchFilterRoutes());
      dispatch(fetchLoadingListRoutes());
      reset();
      close();
    } catch (errors) {
      for (const key in errors) {
        setError(key, { message: errors[key] });
      }
      dispatch(fetchRoutes(searchParams));
      dispatch(fetchRouteDetail(route.id));
      dispatch(fetchFilterRoutes());
      dispatch(fetchLoadingListRoutes());
    } finally {
      setLoading(false);
      setPointsForDelete([]);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && route) {
      const points = route.points.map(({ id, name }) => ({ point_id: { label: name, value: id } }));
      getValues().points.forEach(({ isNew, ...item }, index) => {
        if (isNew && !!errors.points?.[index]?.point_id) {
          points.splice(index, 0, { isNew, ...item });
        }
      });
      setValue('points', points);
    }
  }, [route]);

  return (
    <Modal
      isOpen={isOpen}
      close={() => setCancelConfirm(true)}
      title={uppercase(t('route'))}
      contentStyle={{ maxWidth: 520, width: '100%' }}
    >
      <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
        <DndProvider backend={HTML5Backend}>
          {fields.map((field, index) => (
            <PointCard
              mode={mode}
              fields={fields}
              key={field.id}
              index={index}
              remove={remove}
              insert={insert}
              clearErrors={clearErrors}
              errors={errors}
              control={control}
              move={move}
              setPointsForDelete={setPointsForDelete}
              {...field}
            />
          ))}
        </DndProvider>
        <div className={s.footer}>
          <Button
            onClick={() => setCancelConfirm(true)}
            textButton
            value={t('modalConfirmLabelCancel')}
            style={{ fontSize: 16 }}
          />
          <Button
            value={t(mode === 'create' ? 'modalConfirmLabelConfirm' : 'save')}
            isBlue={mode === 'create'}
            green={mode === 'edit'}
            type="button"
            disabled={loading}
          />
        </div>
      </form>
      <ModalAction
        title={t(mode === 'create' ? 'toCancelRouteCreation' : 'toCancelRouteEditing')}
        description={t('routeDataWillNotBeSaved')}
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
});
