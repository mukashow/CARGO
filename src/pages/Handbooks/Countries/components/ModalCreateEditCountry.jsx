import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { uppercase } from '@/helpers';
import { createCountry, fetchCountryCities, fetchPhoneCode, updateCountry } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditCountry = ErrorBoundaryHoc(
  ({ isOpen, close, mode = 'create', setFieldLabel, expandedCountries }) => {
    const country = useSelector(state => state.country.country);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();

    const schema = yup.object({
      name: yup.string().required(t('fieldShouldBeFilled')),
      letter_for_code: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .matches(/^[a-zA-Z ]*$/, t('onlyLatinCharacters'))
        .max(1, `${t('maxCharactersLength')} 1`),
      phone_code: yup
        .string()
        .min(2, t('fieldShouldBeFilled'))
        .max(6, `${t('maxCharactersLength')} 6`),
    });

    const resolver = useYupValidationResolver(schema);
    const {
      register,
      reset,
      setValue,
      setError,
      getValues,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver,
      defaultValues: {
        name: '',
        letter_for_code: '',
        phone_code: '+',
        name_en: null,
        name_ru: null,
        name_zh_hans: null,
      },
    });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create'
            ? createCountry({ values, searchParams })
            : updateCountry({ id: country.id, values, searchParams })
        ).unwrap();
        dispatch(fetchPhoneCode());
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
      if (country && mode === 'edit') {
        setValue('letter_for_code', country.letter_for_code);
        setValue('phone_code', country.phone_code);
        setValue('name', country.name);
        if (!i18n.language.match(/en|en-US/)) setValue('name_en', country.name_en);
        if (!i18n.language.match(/ru|ru-RU/)) setValue('name_ru', country.name_ru);
        if (!i18n.language.match(/zhHans/)) setValue('name_zh_hans', country.name_zh_hans);
      }
    }, [country]);

    return (
      <Modal
        isOpen={isOpen}
        close={() => setCancelConfirm(true)}
        title={uppercase(t('clientCountry'))}
        contentStyle={{ maxWidth: 422, width: '100%' }}
      >
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={setFieldLabel('countryName')}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <Input
            name="letter_for_code"
            register={register}
            errors={errors.letter_for_code?.message}
            labelText={`${t('clientCodeLetter').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <Input
            name="phone_code"
            register={register}
            errors={errors.phone_code?.message}
            labelText={`${t('phoneNumberCode').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
            onChange={e => {
              setValue(
                'phone_code',
                !e.target.value ? '+' + getValues().phone_code : e.target.value
              );
            }}
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('countryName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('countryName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('countryName').toLowerCase()} ${t('inEnglish')}:`}
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
          isOpen={cancelConfirm || backModalOpen}
          title={t(mode === 'create' ? 'toCancelCountryCreation' : 'toCancelCountryEdition')}
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
  }
);
