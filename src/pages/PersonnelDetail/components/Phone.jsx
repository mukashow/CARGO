import cardStyle from '@components/Card/FormCard/index.module.scss';
import modalStyle from '@components/Modal/index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import * as yup from 'yup';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon, Input, SelectCustom } from '@/components';
import { fetchPhoneCode, fetchPhoneType } from '@actions';
import { updatePersonnelPhone } from '@actions/users';
import { useYupValidationResolver } from '@/hooks';

export const Phone = ErrorBoundaryHoc(
  ({
    id,
    workerId,
    country,
    country_code = '',
    number,
    phone_type,
    phone_type_name,
    phoneId,
    setPhoneMode,
    showDeleteIcon,
  }) => {
    const { phoneCode, phoneType } = useSelector(state => ({
      phoneCode: state.phone.phoneCode,
      phoneType: state.phone.phoneType,
    }));
    const [editMode, setEditMode] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const schema = yup.object({
      country: yup.object().required(t('modalCreateClientRequired')).nullable(),
      number: yup.string().required(t('modalCreateClientRequired')),
      phone_type: yup.object().required(t('fillAllRequiredFields')).nullable(),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      reset,
      control,
      register,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm({
      resolver,
      defaultValues: {
        country: { value: country, label: country_code },
        number: number,
        phone_type: { value: phone_type, label: phone_type_name },
      },
    });

    const onPhoneUpdate = values => {
      dispatch(updatePersonnelPhone({ id: workerId, phoneId: id, ...values }))
        .unwrap()
        .then(() => {
          reset();
          setEditMode(false);
        })
        .catch(errors => {
          for (const key in errors) {
            setError(key, { custom: errors[key] });
          }
        });
    };

    return (
      <>
        {!editMode && (
          <div className={cardStyle.informationRow}>
            <span className={clsx(cardStyle.informationTitle)}>{t('modalCreateClientPhone')}:</span>
            <span className={cardStyle.cardValue} style={{ marginRight: 24 }}>
              {country_code}
              {number} ({phone_type_name})
            </span>
            {showDeleteIcon && (
              <Icon
                iconId="trash"
                color="#DF3B57"
                style={{ marginRight: 12 }}
                clickable
                onClick={() => {
                  phoneId.current = id;
                  setPhoneMode('delete');
                }}
              />
            )}
            <Icon
              iconId="edit"
              color="#0B6BE6"
              clickable
              onClick={() => {
                setEditMode(true);
                dispatch(fetchPhoneCode());
                dispatch(fetchPhoneType());
              }}
            />
          </div>
        )}
        {editMode && (
          <>
            <div>
              <p style={{ fontSize: 14, lineHeight: '20px', marginBottom: 3 }}>
                {t('modalCreateClientPhone')}:
              </p>
              <div className={modalStyle.fieldGroup}>
                <SelectCustom
                  name="country"
                  control={control}
                  errorBorder={!!errors.country?.message}
                  errors={errors.country?.custom}
                  style={{ width: 95 }}
                  placeholder="----"
                  options={phoneCode.map(({ id, phone_code }) => ({
                    label: phone_code,
                    value: id,
                  }))}
                />
                <Input
                  containerStyle={{ flexGrow: 1 }}
                  placeholder="--- -- -- --"
                  name="number"
                  {...(errors.number?.message && { style: { borderColor: '#DF3B57' } })}
                  errors={errors.number?.custom}
                  register={register}
                />
                <div className={modalStyle.fieldGroup} style={{ marginLeft: 24, flexGrow: 0 }}>
                  <Icon
                    iconId="cross"
                    clickable
                    color="#828282"
                    onClick={() => {
                      setEditMode(null);
                      reset();
                    }}
                  />
                  <Icon
                    iconId="access"
                    clickable
                    color="#009E61"
                    onClick={handleSubmit(onPhoneUpdate)}
                  />
                </div>
              </div>
            </div>
            <SelectCustom
              name="phone_type"
              control={control}
              error={errors.phone_type?.custom || errors.phone_type?.message}
              errorBorder={!!errors.phone_type?.message}
              placeholder={t('selectRequired')}
              options={phoneType.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
            />
          </>
        )}
      </>
    );
  }
);
