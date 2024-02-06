import s from '@pages/ActAcceptanceCreate/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as yup from 'yup';
import { date } from 'yup';
import { Button, Modal, ModalAction } from '@components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  createContainer,
  fetchAllContainersState,
  fetchContainerOne,
  fetchContainerOwnershipType,
  fetchWarehouseList,
  updateContainer,
} from '@actions';
import { useConfirmNavigate } from '@hooks';
import { Form } from './Form';

dayjs.extend(customParseFormat);

export const ModalCreateUpdateContainer = ErrorBoundaryHoc(
  ({ isOpen, close, callback, defaultValues, disabledFields, mode, containerId }) => {
    const roleId = useSelector(state => state.auth.user.role_id);
    const container = useSelector(state => state.container.containerOne);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [backModalOpen, backConfirmResolve, cancelBack, setCancelModalOpen] =
      useConfirmNavigate(isOpen);

    const number = yup.lazy(value => {
      if (value === '') return yup.string().required(t('fieldShouldBeFilled'));
      return yup
        .number()
        .typeError(t('enterNumber'))
        .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
        .transform((_, originalValue) => Number(String(originalValue).replace(/,/g, '.')));
    });

    const validationSchema = yup.object({
      number: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`),
      warehouse:
        roleId === 5 && mode !== 'edit'
          ? yup.object().required(t('fieldShouldBeFilled'))
          : mode === 'edit'
          ? yup.string().nullable()
          : yup.object().nullable(),
      return_at: yup.lazy((_, { parent }) => {
        if (parent.property_type?.id === 2) {
          return date().required(t('fieldShouldBeFilled')).nullable();
        }
        return date().nullable();
      }),
      arriving_date: mode === 'edit' ? yup.string().nullable() : date().nullable(),
      return_warehouse: yup.lazy((_, { parent }) => {
        if (parent.property_type?.id === 2) {
          return yup.object().required(t('fieldShouldBeFilled')).nullable();
        }
        return yup.object().nullable();
      }),
      property_type: yup.object().required(t('fieldShouldBeFilled')),
      company: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`),
      container_state: yup.object().required(t('fieldShouldBeFilled')),
      weight: number,
      max_weight: number,
      max_volume: number,
    });

    const {
      handleSubmit,
      register,
      control,
      formState: { errors },
      setError,
      setValue,
      watch,
      reset,
    } = useForm({
      resolver: yupResolver(validationSchema),
      defaultValues,
    });

    const onContainerCreate = async values => {
      setLoading(true);
      try {
        const data = await dispatch(
          mode === 'edit'
            ? updateContainer({ id: containerId, ...values })
            : createContainer(values)
        ).unwrap();
        reset();
        close();
        if (callback) {
          return callback(data);
        }
        navigate(`/container/${data}/`);
      } catch (errors) {
        for (const error in errors) {
          setError(error, { type: 'custom', message: errors[error] });
        }
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (isOpen) {
        dispatch(fetchWarehouseList());
        dispatch(fetchAllContainersState());
        dispatch(fetchContainerOwnershipType());

        if (mode === 'edit') {
          dispatch(fetchContainerOne(containerId));
        }
      }
    }, [isOpen]);

    useEffect(() => {
      for (const key in defaultValues) {
        setValue(key, defaultValues[key]);
      }
    }, [defaultValues]);

    useEffect(() => {
      if (container && mode === 'edit') {
        const {
          number,
          warehouse,
          arriving_date,
          container_state,
          weight,
          property_type,
          company,
          return_at,
          return_warehouse,
          max_weight,
          max_volume,
        } = container;
        setValue('number', number);
        setValue('arriving_date', arriving_date);
        setValue('warehouse', warehouse.name);
        setValue('container_state', container_state);
        setValue('weight', weight);
        setValue('property_type', property_type);
        setValue('company', company);
        setValue('return_at', dayjs(return_at, 'DD.MM.YYYY').toDate());
        setValue('return_warehouse', return_warehouse);
        setValue('max_weight', max_weight);
        setValue('max_volume', max_volume);
      }
    }, [container]);

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelModalOpen(true)}
        contentStyle={{
          maxWidth: 1370,
          width: '100%',
          padding: '24px clamp(24px, 2vw, 40px) clamp(3px, 3vw, 60px) clamp(24px, 2vw, 40px)',
        }}
      >
        <ModalAction
          isOpen={backModalOpen}
          title={t(mode === 'edit' ? 'cancelContainerEditing' : 'cancelContainerCreation')}
          description={t('containerDataWillNotBeSaved')}
          onSubmit={() => {
            backConfirmResolve();
            setCancelModalOpen(false);
            close();
            reset();
          }}
          onCancel={cancelBack}
        />
        <Button
          value={t(mode === 'edit' ? 'containerEditing' : 'containerCreation')}
          isStaticTitle
          style={{ display: 'inline-flex', marginBottom: 24 }}
        />
        <div className={s.formWrap}>
          <Form
            errors={errors}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            disabledFields={disabledFields}
            mode={mode}
          />
        </div>
        <div className={s.footer}>
          <Button
            value={t(mode === 'edit' ? 'save' : 'modalCreateClientCreate')}
            onClick={handleSubmit(onContainerCreate)}
            disabled={loading}
            isBlue={mode !== 'edit'}
            isOrange={mode === 'edit'}
          />
          <Button value={t('cancel')} onClick={() => setCancelModalOpen(true)} />
        </div>
      </Modal>
    );
  }
);
