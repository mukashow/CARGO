import s from '../index.module.scss';
import modalStyle from '@/components/Modal/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  fetchCountryCitiesByParams,
  fetchPhoneCode,
  fetchWarehouseList,
  updateWarehouse,
} from '@/store/actions';
import * as yup from 'yup';
import {
  Button,
  ErrorBoundaryHoc,
  Icon,
  Input,
  Modal,
  ModalAction,
  SelectCustom,
} from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalEditWarehouse = ErrorBoundaryHoc(({ isOpen, close, setFieldLabel }) => {
  const countries = useSelector(state => state.phone.phoneCode);
  const warehouse = useSelector(state => state.warehouse.warehouse);
  const { availableManagers, availableCashiers, availableStorekeepers } = useSelector(state => ({
    availableManagers: state.users.availableManagersWithCurrentWarehouse,
    availableCashiers: state.users.availableCashiersWithCurrentWarehouse,
    availableStorekeepers: state.users.availableStorekeepersWithCurrentWarehouse,
  }));
  const [searchParams] = useSearchParams();
  const [cities, setCities] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);

  const selectSchema = yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.number().required(),
    })
    .default(undefined)
    .required(t('fieldShouldBeFilled'))
    .nullable();
  const schema = yup.object({
    name: yup.string().required(t('fieldShouldBeFilled')),
    city: selectSchema,
    address: yup.string().required(t('fieldShouldBeFilled')),
    contacts: yup.string().required(t('fieldShouldBeFilled')),
    country: selectSchema,
  });
  const resolver = useYupValidationResolver(schema);
  const {
    watch,
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: {
      name: '',
      city: null,
      address: '',
      contacts: '',
      manager: null,
      cashier: null,
      country: null,
      storekeepers: [],
    },
  });
  const storekeepersField = watch('storekeepers');

  const onCountryChange = async ({ value }) => {
    const cities = await dispatch(fetchCountryCitiesByParams(`country_id=${value}`)).unwrap();
    setCities(cities);
    setValue('city', null);
  };

  const onSubmit = async values => {
    setLoading(true);
    try {
      await dispatch(updateWarehouse({ id: warehouse.id, values, searchParams })).unwrap();
      dispatch(fetchWarehouseList());
      close();
      reset();
    } catch (errors) {
      for (const key in errors) {
        setError(key, { message: errors[key], type: 'custom' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouse && isOpen && availableManagers && availableCashiers && availableStorekeepers) {
      const {
        name,
        name_zh_hans,
        name_en,
        name_ru,
        address,
        contacts,
        city: cityId,
        country_name,
        city_name,
        manager: managerId,
        cashier: cashierId,
        storekeepers: storekeeperIds,
      } = warehouse;

      setValue('name', name);
      setValue('contacts', contacts);
      setValue('address', address);

      if (i18n.language !== 'zhHans') setValue('name_zh_hans', name_zh_hans);
      if (!i18n.language.match(/en|en-US/)) setValue('name_en', name_en);
      if (!i18n.language.match(/ru|ru-RU/)) setValue('name_ru', name_ru);

      setValue('city', { value: cityId, label: city_name });

      const manager = availableManagers.find(({ id }) => id === managerId);
      setValue(
        'manager',
        manager
          ? {
              value: manager.id,
              label: `${manager.last_name} ${manager.name} ${manager.otchestvo || ''}`,
            }
          : null
      );

      const cashier = availableCashiers.find(({ id }) => id === cashierId);
      setValue(
        'cashier',
        cashier
          ? {
              value: cashier.id,
              label: `${cashier.last_name} ${cashier.name} ${cashier.otchestvo || ''}`,
            }
          : null
      );

      const foundStorekeepers = availableStorekeepers.filter(({ id }) =>
        storekeeperIds.includes(id)
      );
      setValue(
        'storekeepers',
        foundStorekeepers.map(({ id, name, last_name, otchestvo }) => ({
          value: id,
          label: `${last_name} ${name} ${otchestvo || ''}`,
        }))
      );

      const country = countries.find(({ name }) => name === country_name);
      if (country) setValue('country', { label: country.name, value: country.id });

      if (!cities) {
        dispatch(fetchCountryCitiesByParams(`country_name=${country_name}`))
          .unwrap()
          .then(setCities);
      }
    }
  }, [warehouse, isOpen, availableManagers, availableCashiers, availableStorekeepers]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPhoneCode());
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      close={() => setCancelConfirm(true)}
      title={t('warehousePage')}
      contentStyle={{ maxWidth: 804, width: '100%' }}
    >
      <div className={s.modal}>
        <div className={s.fieldsWrap}>
          <div className={s.fields}>
            <Input
              name="name"
              register={register}
              errors={errors.name?.message}
              labelText={setFieldLabel('warehouseName')}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            {i18n.language !== 'zhHans' && (
              <Input
                name="name_zh_hans"
                register={register}
                errors={errors.name_zh_hans?.message}
                labelText={`${t('warehouseName').toLowerCase()} ${t('inChinese')}:`}
                placeholder={t('enterValueOptional')}
              />
            )}
            {!i18n.language.match(/ru|ru-RU/) && (
              <Input
                name="name_ru"
                register={register}
                errors={errors.name_ru?.message}
                labelText={`${t('warehouseName').toLowerCase()} ${t('inRussian')}:`}
                placeholder={t('enterValueOptional')}
              />
            )}
            {!i18n.language.match(/en|en-US/) && (
              <Input
                name="name_en"
                register={register}
                errors={errors.name_en?.message}
                labelText={`${t('warehouseName').toLowerCase()} ${t('inEnglish')}:`}
                placeholder={t('enterValueOptional')}
              />
            )}
            <SelectCustom
              name="country"
              control={control}
              error={errors.country?.message}
              labelText={`${t('clientCountry')}:`}
              options={countries?.map(({ id, name }) => ({ label: name, value: id }))}
              placeholder={t('modalCreateClientPlaceholder')}
              onChange={onCountryChange}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            <SelectCustom
              name="city"
              control={control}
              error={errors.city?.message}
              labelText={`${t('city')}:`}
              options={cities?.map(({ id, name }) => ({ label: name, value: id }))}
              placeholder={t('modalCreateClientPlaceholder')}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            <Input
              name="address"
              register={register}
              errors={errors.address?.message}
              labelText={`${t('clientAddress')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
          </div>
          <div className={s.fields}>
            <Input
              name="contacts"
              register={register}
              errors={errors.contacts?.message}
              labelText={`${t('contacts')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <SelectCustom
              name="manager"
              control={control}
              error={errors.manager?.message}
              options={availableManagers?.map(({ id, name, last_name, otchestvo }) => ({
                label: `${last_name} ${name} ${otchestvo || ''}`,
                value: id,
              }))}
              labelText={`${t('manager')}:`}
              placeholder={t('modalCreateClientPlaceholderSelectRequired')}
              isClearable
            />
            <SelectCustom
              name="cashier"
              control={control}
              error={errors.cashier?.message}
              options={availableCashiers?.map(({ id, name, last_name, otchestvo }) => ({
                label: `${last_name} ${name} ${otchestvo || ''}`,
                value: id,
              }))}
              labelText={`${t('cashier')}:`}
              placeholder={t('modalCreateClientPlaceholderSelectRequired')}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isClearable
            />
            {storekeepersField.map((field, index) => (
              <div className={s.fieldWithIcon} key={index}>
                <SelectCustom
                  value={field}
                  onChange={value =>
                    setValue(
                      'storekeepers',
                      storekeepersField.map((item, itemIndex) => {
                        if (itemIndex !== index) return item;
                        return value || '';
                      })
                    )
                  }
                  error={errors.storekeepers?.message[index]}
                  options={availableStorekeepers
                    ?.filter(
                      ({ id }) =>
                        !storekeepersField
                          .map(item => (item === null ? '' : item))
                          .find(({ value }) => value === id)
                    )
                    .map(({ id, name, last_name, otchestvo }) => ({
                      label: `${last_name} ${name} ${otchestvo || ''}`,
                      value: id,
                    }))}
                  labelText={`${t('storekeeper')}:`}
                  placeholder={t('modalCreateClientPlaceholderSelectRequired')}
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                <Icon
                  iconId="trash"
                  color="#DF3B57"
                  iconClass={s.fieldIcon}
                  clickable
                  onClick={() =>
                    setValue(
                      'storekeepers',
                      storekeepersField.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                />
              </div>
            ))}
            {storekeepersField.length !== availableStorekeepers?.length && (
              <Button
                value={t('addStorekeeper')}
                textButton
                isSmall
                iconLeftId="blue-plus"
                className={modalStyle.fieldsAddBtn}
                onClick={() => setValue('storekeepers', [...storekeepersField, ''])}
              />
            )}
          </div>
        </div>
        <div className={s.footer}>
          <Button
            onClick={() => setCancelConfirm(true)}
            textButton
            value={t('modalConfirmLabelCancel')}
            style={{ fontSize: 16 }}
          />
          <Button value={t('save')} green onClick={handleSubmit(onSubmit)} disabled={loading} />
        </div>
      </div>
      <ModalAction
        isOpen={cancelConfirm || backModalOpen}
        title={t('toCancelWarehouseEditing')}
        description={t('toCancelWarehouseEditingDescription')}
        onCancel={() => {
          setCancelConfirm(false);
          onCancel();
        }}
        onSubmit={() => {
          close();
          reset();
          backConfirm();
          setCancelConfirm(false);
        }}
      />
    </Modal>
  );
});
