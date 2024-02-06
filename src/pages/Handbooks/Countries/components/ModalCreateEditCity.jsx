import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import {
  createCity,
  fetchCities,
  fetchCountries,
  fetchCountryCities,
  updateCity,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditCity = ErrorBoundaryHoc(
  ({ isOpen, close, country, mode = 'create', setFieldLabel, expandedCountries }) => {
    const countries = useSelector(state => state.phone.phoneCode);
    const city = useSelector(state => state.country.city);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      name: yup.string().required(t('fieldShouldBeFilled')),
      country: yup.object().required(t('fieldShouldBeFilled')).nullable(),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      register,
      reset,
      control,
      handleSubmit,
      setError,
      setValue,
    } = useForm({
      defaultValues: { name: '', country: '', name_zh_hans: null, name_ru: null, name_en: null },
      resolver,
    });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(mode === 'create' ? createCity(values) : updateCity(values)).unwrap();
        await dispatch(fetchCountries(searchParams));
        dispatch(fetchCities());
        reset();
        close();
        expandedCountries.forEach(item => {
          dispatch(fetchCountryCities(item));
        });
      } catch (errors) {
        for (const key in errors) {
          setError(key, { message: errors[key], type: 'custom' });
        }
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (city && mode === 'edit') {
        setValue('country', { value: city.country, label: city.country_name });
        setValue('name', city.name);
        setValue('name_ru', !i18n.language.match(/ru|ru-RU/) ? city.name_ru : null);
        setValue('name_en', !i18n.language.match(/en|en-US/) ? city.name_en : null);
        setValue('name_zh_hans', i18n.language !== 'zhHans' ? city.name_zh_hans : null);
        setValue('id', city.id);
      }
    }, [city, countries, mode]);

    useEffect(() => {
      if (country && mode === 'create') {
        setValue('country', { label: country.name, value: country.id });
      }
    }, [country, mode]);

    return (
      <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={uppercase(t('city'))}>
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={setFieldLabel('cityName')}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <SelectCustom
            name="country"
            options={countries.map(({ id, name }) => ({ label: name, value: id }))}
            control={control}
            error={errors.country?.message}
            labelText={`${t('clientCountry').toLowerCase()}:`}
            placeholder={t('selectRequired')}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('cityName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('cityName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('cityName').toLowerCase()} ${t('inEnglish')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
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
          title={t(mode === 'create' ? 'toCancelCityCreation' : 'toCancelUpdatingCity')}
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
