import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWarehouseList } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { fetchPhoneCode, fetchPhoneType } from '@actions/phone';
import { createEmployee, fetchRoles } from '@actions/users';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEmployee = ErrorBoundaryHoc(({ isOpen, close }) => {
  const countries = useSelector(state => state.phone.phoneCode);
  const roles = useSelector(state => state.users.roles);
  const warehouseList = useSelector(state => state.warehouse.warehouseList);
  const { phoneTypes, phoneCodes } = useSelector(state => ({
    phoneTypes: state.phone.phoneType,
    phoneCodes: state.phone.phoneCode,
  }));
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backModalOpen, onBackConfirm, onBackCancel] = useConfirmNavigate(isOpen);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reqFieldSchema = yup
    .string()
    .required(t('fieldShouldBeFilled'))
    .max(20, `${t('maxCharactersLength')} 20`);
  const schema = yup.object({
    last_name: reqFieldSchema,
    name: reqFieldSchema,
    otchestvo: yup.string().nullable(),
    role: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    home_address: yup.string().required(t('fieldShouldBeFilled')),
    working_hours: yup
      .string()
      .max(17, `${t('maxCharactersLength')} 17`)
      .nullable(),
    username: reqFieldSchema,
    country: yup.lazy((_, { parent }) => {
      if (parent.role?.value === 4) {
        return yup.object().required(t('fieldShouldBeFilled')).nullable();
      }
      return yup.object().nullable();
    }),
    password: reqFieldSchema,
    phones: yup.array().of(
      yup.object().shape({
        country: yup.object().required(t('fieldShouldBeFilled')).nullable(),
        number: yup.string().required(t('fieldShouldBeFilled')),
        phone_type: yup.object().required(t('fieldShouldBeFilled')).nullable(),
      })
    ),
  });
  const resolver = useYupValidationResolver(schema);
  const {
    reset,
    setValue,
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: {
      last_name: '',
      name: '',
      otchestvo: '',
      role: null,
      home_address: '',
      warehouse: null,
      working_hours: '',
      username: '',
      password: '',
      phones: [{ country: null, number: '', phone_type: null }],
      country: null,
    },
  });
  const { fields, remove, append } = useFieldArray({ control, name: 'phones' });
  const role = watch('role');

  const onSubmit = async values => {
    setLoading(true);
    try {
      const { id } = await dispatch(createEmployee(values)).unwrap();
      close();
      reset();
      navigate(`/personnel/${id}/`);
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
    if (isOpen) {
      dispatch(fetchRoles());
      dispatch(fetchPhoneType());
      dispatch(fetchPhoneCode());
      dispatch(fetchWarehouseList());
    }
  }, [isOpen]);

  useEffect(() => {
    if (role?.value !== 4) setValue('country', null);
  }, [role]);

  return (
    <Modal
      title={t('employee')}
      isOpen={isOpen}
      close={() => setCancelConfirmModal(true)}
      contentStyle={{ maxWidth: 804, width: '100%' }}
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
          <SelectCustom
            control={control}
            name="role"
            error={errors.role?.message}
            options={roles?.map(({ id, name }) => ({ label: name, value: id }))}
            labelText={`${t('humanPosition')}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          {role?.value === 4 && (
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
          {fields.map((field, index) => (
            <React.Fragment key={field.id}>
              <div className={s.fieldGroup}>
                <SelectCustom
                  name={`phones.${index}.country`}
                  error={errors[`phones[${index}].country`]?.message}
                  control={control}
                  style={{ width: 95 }}
                  labelText={`${t('modalCreateClientCodeCountry')}:`}
                  placeholder="----"
                  options={phoneCodes?.map(({ id, phone_code }) => ({
                    label: phone_code,
                    value: id,
                  }))}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                <Input
                  name={`phones.${index}.number`}
                  errors={errors[`phones[${index}].number`]?.message}
                  register={register}
                  labelText={`${t('modalCreateClientPhone')}:`}
                  placeholder="--- -- -- --"
                  iconId={fields.length > 1 && 'trash'}
                  iconClick={() => remove(index)}
                />
              </div>
              <SelectCustom
                name={`phones.${index}.phone_type`}
                error={errors[`phones[${index}].phone_type`]?.message}
                control={control}
                labelText={`${t('modalCreateClientPhoneType')}:`}
                placeholder={t('selectRequired')}
                options={phoneTypes?.map(({ id, name }) => ({
                  label: name,
                  value: id,
                }))}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </React.Fragment>
          ))}
          <Button
            className={s.fieldsAddBtn}
            value={t('modalCreateClientPhoneAdd')}
            textButton
            iconLeftId="blue-plus"
            isSmall
            onClick={() => append({ country: null, phone: '', phone_type: null })}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={s.columnFields} style={{ marginBottom: 24 }}>
            <Input
              register={register}
              name="home_address"
              errors={errors.home_address?.message}
              labelText={`${t('clientAddress')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            {role?.value !== 5 && (
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
            <Input
              register={register}
              name="password"
              errors={errors.password?.message}
              labelText={`${t('clientPassword')}:`}
            />
          </div>
          <Button
            value={t('sidebarCreate')}
            isBlue
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
        title={t('toCancelEmployeeCreation')}
        description={t('toCancelEmployeeCreationDescription')}
      />
    </Modal>
  );
});
