import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  fetchPersonnel,
  fetchPersonnelDetail,
  fetchWarehouseList,
  updateEmployee,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalEditEmployee = ErrorBoundaryHoc(({ isOpen, close, initData }) => {
  const countries = useSelector(state => state.phone.phoneCode);
  const warehouseList = useSelector(state => state.warehouse.warehouseList);
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);
  const [employee, setEmployee] = useState(initData);
  const [searchParams] = useSearchParams();
  const { warehouseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [backModalOpen, onBackConfirm, onBackCancel] = useConfirmNavigate(isOpen);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const reqFieldSchema = yup
    .string()
    .required(t('fieldShouldBeFilled'))
    .max(20, `${t('maxCharactersLength')} 20`);
  const schema = yup.object({
    last_name: reqFieldSchema,
    name: reqFieldSchema,
    otchestvo: yup.string().nullable(),
    home_address: yup.string().required(t('fieldShouldBeFilled')),
    country: yup.lazy((_, { parent }) => {
      if (parent.role?.value === 4) {
        return yup.object().required(t('fieldShouldBeFilled')).nullable();
      }
      return yup.object().nullable();
    }),
    working_hours: yup
      .string()
      .max(17, `${t('maxCharactersLength')} 17`)
      .nullable(),
    username: reqFieldSchema,
  });
  const resolver = useYupValidationResolver(schema);
  const {
    setValue,
    register,
    control,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: {
      last_name: '',
      name: '',
      otchestvo: null,
      home_address: '',
      warehouse: null,
      working_hours: null,
      username: '',
    },
  });
  const role = watch('role');

  const onSubmit = async ({ warehouse, ...values }) => {
    try {
      setLoading(true);
      await dispatch(
        updateEmployee(warehouse?.value === initData.warehouse ? values : { warehouse, ...values })
      ).unwrap();
      close();
      const params = `page=${searchParams.get('page')}&page_size=${searchParams.get(
        'page_size'
      )}&warehouse__in=${warehouseId}`;
      dispatch(fetchPersonnel(warehouseId ? params : searchParams));
      dispatch(fetchPersonnelDetail(initData.id));
    } catch (errors) {
      for (const key in errors) {
        if (key === 'custom_clearance_country') {
          setError('country', { message: errors[key], type: 'custom' });
        } else {
          setError(key, { message: errors[key], type: 'custom' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee) {
      const {
        name,
        last_name,
        otchestvo,
        home_address,
        warehouse,
        warehouse_name,
        working_hours,
        username,
        id,
        role,
        custom_clearance_country,
      } = employee;
      setValue('id', id);
      setValue('name', name);
      setValue('last_name', last_name);
      setValue('otchestvo', otchestvo);
      setValue('home_address', home_address);
      setValue('working_hours', working_hours);
      setValue('username', username);
      setValue('role', role);
      if (warehouse) {
        setValue('warehouse', { value: warehouse, label: warehouse_name });
      }
      setValue('country', {
        value: custom_clearance_country?.id,
        label: custom_clearance_country?.name,
      });
    }
  }, [employee]);

  useEffect(() => setEmployee(initData), [initData]);

  useEffect(() => {
    if (!isOpen) {
      setEmployee(null);
    } else {
      dispatch(fetchWarehouseList());
    }
  }, [isOpen]);

  return (
    <Modal
      title={t('employee')}
      isOpen={isOpen}
      close={() => setCancelConfirmModal(true)}
      contentStyle={{ maxWidth: 804, width: '100%' }}
      overflow="visible"
    >
      <form className={s.columns} onSubmit={handleSubmit(onSubmit)}>
        <div className={s.columnFields}>
          <Input
            register={register}
            name="last_name"
            errors={errors.last_name?.message}
            labelText={`${t('clientFilterLastName').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <Input
            register={register}
            name="name"
            errors={errors.name?.message}
            labelText={`${t('clientFilterName').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <Input
            register={register}
            name="otchestvo"
            errors={errors.otchestvo?.message}
            labelText={`${t('modalCreateClientOtchestvo').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholderRequired')}
          />
          <Input
            register={register}
            name="home_address"
            errors={errors.home_address?.message}
            labelText={`${t('clientAddress')}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={s.columnFields} style={{ marginBottom: 24 }}>
            {role === 4 && (
              <SelectCustom
                control={control}
                name="country"
                error={errors.country?.message}
                options={countries?.map(({ id, name }) => ({ label: name, value: id }))}
                labelText={`${t('clientCountry')}:`}
                placeholder={t('modalCreateClientPlaceholder')}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            )}
            {role !== 5 && (
              <SelectCustom
                control={control}
                name="warehouse"
                error={errors.warehouse?.message}
                labelText={t('warehouse')}
                placeholder={t('selectRequired')}
                options={warehouseList?.map(({ id, name }) => ({ label: name, value: id }))}
              />
            )}
            <Input
              register={register}
              name="working_hours"
              errors={errors.working_hours?.message}
              labelText={`${t('shift')}:`}
              placeholder={t('modalCreateClientPlaceholderRequired')}
            />
            <Input
              register={register}
              name="username"
              errors={errors.username?.message}
              labelText={`${t('clientLogin')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
          </div>
          <Button
            value={t('save')}
            green
            style={{ margin: 'auto 0 0 auto' }}
            type="button"
            disabled={loading}
          />
        </div>
      </form>
      <ModalAction
        isOpen={cancelConfirmModal || backModalOpen}
        onCancel={() => {
          setCancelConfirmModal(false);
          onBackCancel();
        }}
        onSubmit={() => {
          setCancelConfirmModal(false);
          close();
          reset();
          onBackConfirm();
        }}
        title={t('toCancelEmployeeEdition')}
        description={t('toCancelEmployeeCreationDescription')}
      />
    </Modal>
  );
});
