import s from '@pages/ActAcceptanceCreate/index.module.scss';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { DatePicker, FormCard, Input, SelectCustom } from '@components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const Form = ErrorBoundaryHoc(
  ({ control, errors, register, watch, setValue, disabledFields, mode }) => {
    const roleId = useSelector(state => state.auth.user.role_id);
    const warehouseList = useSelector(state => state.warehouse.warehouseList);
    const containerStateList = useSelector(state => state.container.allContainersState);
    const ownershipTypeList = useSelector(state => state.container.ownershipType);
    const { t } = useTranslation();
    const ownershipType = watch('property_type');

    useEffect(() => {
      if (ownershipType?.id !== 2) {
        setValue('return_at', null);
        setValue('return_warehouse', null);
      }
    }, [ownershipType]);

    return (
      <form className={clsx(s.form, s.manager)}>
        <FormCard cardTitle={t('container')}>
          <div className={s.selectsWrap}>
            <Input
              register={register}
              name="number"
              labelText={`${t('containerNumber')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              errors={errors.number?.message}
            />
            {mode === 'edit' ? (
              <Input
                name="arriving_date"
                labelText={`${t('arrivalDate').toLowerCase()}:`}
                lined
                disabled
                register={register}
              />
            ) : (
              <DatePicker
                name="arriving_date"
                labelText={`${t('arrivalDate').toLowerCase()}:`}
                control={control}
                placeholder={t('enterValueOptional')}
                iconColor="#0B6BE6"
                errors={errors.arriving_data?.message}
              />
            )}
            {roleId === 5 &&
              (mode === 'edit' ? (
                <Input
                  name="warehouse"
                  labelText={t('warehouse')}
                  lined
                  disabled
                  register={register}
                />
              ) : (
                <SelectCustom
                  control={control}
                  name="warehouse"
                  options={warehouseList}
                  getOptionValue={option => option.id}
                  getOptionLabel={option => option.name}
                  labelText={t('warehouse')}
                  placeholder={t('modalCreateClientPlaceholder')}
                  error={errors.warehouse?.message}
                  lined={!!disabledFields?.warehouse}
                  isDisabled={!!disabledFields?.warehouse}
                />
              ))}
            <SelectCustom
              control={control}
              name="container_state"
              options={containerStateList}
              getOptionValue={option => option.id}
              getOptionLabel={option => option.name}
              labelText={`${t('state').toLowerCase()}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              error={errors.container_state?.message}
            />
            <Input
              register={register}
              name="weight"
              labelText={`${t('selfWeight').toLowerCase()}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              errors={errors.weight?.message}
              endText={t('weightKg')}
            />
          </div>
        </FormCard>
        <FormCard cardTitle={t('ownershipType')}>
          <div className={s.selectsWrap}>
            <SelectCustom
              control={control}
              name="property_type"
              options={ownershipTypeList}
              getOptionValue={option => option.id}
              getOptionLabel={option => option.name}
              labelText={`${t('ownershipType').toLowerCase()}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              error={errors.property_type?.message}
            />
            <Input
              register={register}
              name="company"
              labelText={`${t('owner').toLowerCase()}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              errors={errors.company?.message}
            />
            {ownershipType?.id === 2 && (
              <>
                <DatePicker
                  name="return_at"
                  labelText={`${t('returnDate').toLowerCase()}:`}
                  control={control}
                  placeholder={t('modalCreateClientPlaceholderRequired')}
                  iconColor="#0B6BE6"
                  errors={errors.return_at?.message}
                />
                <SelectCustom
                  control={control}
                  name="return_warehouse"
                  options={warehouseList}
                  getOptionValue={option => option.id}
                  getOptionLabel={option => option.name}
                  labelText={`${t('returnWarehouse').toLowerCase()}:`}
                  placeholder={t('modalCreateClientPlaceholderRequired')}
                  error={errors.return_warehouse?.message}
                />
              </>
            )}
          </div>
        </FormCard>
        <FormCard cardTitle={t('capacity')}>
          <div className={s.selectsWrap}>
            <Input
              register={register}
              name="max_weight"
              labelText={`${t('weight')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              errors={errors.max_weight?.message}
              endText={t('weightKg')}
            />
            <Input
              register={register}
              name="max_volume"
              labelText={`${t('volume')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              errors={errors.max_volume?.message}
              endText={t('cubicMeter')}
            />
          </div>
        </FormCard>
      </form>
    );
  }
);
