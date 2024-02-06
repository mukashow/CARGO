import React, { useEffect } from 'react';
import modalStyle from '@components/Modal/index.module.scss';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Input, SelectCustom } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { addPersonnelPhone } from '@actions/users';
import { useYupValidationResolver } from '@/hooks';
import { fetchPhoneCode, fetchPhoneType } from '@actions/phone';

export const AddPhone = ErrorBoundaryHoc(({ phoneMode, setPhoneMode }) => {
  const employee = useSelector(state => state.users.employee);
  const { phoneCode, phoneType } = useSelector(state => ({
    phoneCode: state.phone.phoneCode,
    phoneType: state.phone.phoneType,
  }));
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
      country: null,
      number: '',
      phone_type: null,
    },
  });

  const onPhoneAdd = values => {
    dispatch(addPersonnelPhone({ id: employee.id, ...values }))
      .unwrap()
      .then(() => {
        reset();
        setPhoneMode(null);
      })
      .catch(errors => {
        for (const key in errors) {
          setError(key, { custom: errors[key] });
        }
      });
  };

  useEffect(() => {
    if (phoneMode === 'create') {
      dispatch(fetchPhoneCode());
      dispatch(fetchPhoneType());
    }
  }, [phoneMode]);

  return (
    <>
      {phoneMode === 'create' && (
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
                    setPhoneMode(null);
                    reset();
                  }}
                />
                <Icon
                  iconId="access"
                  clickable
                  color="#009E61"
                  onClick={handleSubmit(onPhoneAdd)}
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
      {phoneMode !== 'create' && (
        <Button
          className={modalStyle.fieldsAddBtn}
          value={t('modalCreateClientPhoneAdd')}
          textButton
          iconLeftId="blue-plus"
          isSmall
          onClick={() => setPhoneMode('create')}
        />
      )}
    </>
  );
});
