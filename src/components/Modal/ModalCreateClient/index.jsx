import s from './index.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCodeAndPassword,
  fetchManagerCountry,
  fetchPhoneCode,
  fetchPhoneType,
  getClientCreate,
} from '@/store/actions';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import dayjs from 'dayjs';
import * as yup from 'yup';
import {
  Button,
  DatePicker,
  ErrorBoundaryHoc,
  Icon,
  Input,
  Modal,
  ModalAction,
  SelectCustom,
} from '@/components';
import { useConfirmNavigate } from '@hooks';

export const ModalCreateClient = ErrorBoundaryHoc(({ isOpen, close, callback }) => {
  const roleId = useSelector(state => state.auth.user.role_id);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [backModalOpen, backConfirmResolve, cancelBack, setCancelModalOpen] =
    useConfirmNavigate(isOpen);

  const validationSchema = yup.object({
    last_name: yup
      .string()
      .required(t('modalCreateClientRequired'))
      .max(50, 'Не больше 50 символов'),
    name: yup.string().required(t('modalCreateClientRequired')).max(50, 'Не больше 50 символов'),
    otchestvo: yup.string().max(50, 'Не больше 50 символов'),
    birth_date: yup.string().required(t('modalCreateClientRequired')),
    address: yup
      .string()
      .required(t('modalCreateClientRequired'))
      .max(256, 'Не больше 256 символов'),
    company: yup
      .string()
      .required(t('modalCreateClientRequired'))
      .max(127, 'Не больше 127 символов'),
    country: yup.object().required(t('modalCreateClientRequired')).nullable(),
    username: yup
      .string()
      .required(t('modalCreateClientRequired'))
      .max(20, 'Не больше 20 символов'),
    phones: yup.array().of(
      yup.object().shape({
        country: yup.object().required(t('modalCreateClientRequired')).nullable(),
        number: yup
          .string()
          .required(t('modalCreateClientRequired'))
          .max(25, 'Не больше 25 символов'),
        phone_type: yup.object().required(t('modalCreateClientRequired')).nullable(),
      })
    ),
  });
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      phones: [
        {
          country: null,
          number: '',
          phone_type: null,
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'phones', // unique name for your Field Array
  });

  const phoneCode = useSelector(state => state.phone.phoneCode);
  const phoneType = useSelector(state => state.phone.phoneType);
  const defaultCountryCode = useRef(null);

  const country = watch('country');
  const phones = watch('phones');

  useEffect(() => {
    if (country) {
      dispatch(fetchCodeAndPassword({ id: country.value, setValue }));
      clearErrors('code');
      clearErrors('password');
    }
  }, [country]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPhoneType());
      dispatch(fetchPhoneCode());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && roleId === 1) {
      dispatch(fetchManagerCountry())
        .unwrap()
        .then(({ id, name }) => {
          setValue('country', { value: id, label: name });
          const country = phoneCode.find(code => code.id === id);
          const defaultCode = { value: country.id, label: country.phone_code };
          setValue('phones.0.country', defaultCode);
          defaultCountryCode.current = defaultCode;
        });
    }
  }, [isOpen]);

  const onConfirm = () => {
    setCancelModalOpen(false);
    close();
    reset();
  };

  const onSubmit = data => {
    setLoading(true);
    data = { ...data, birth_date: dayjs(data.birth_date).format('DD.MM.YYYY') };
    getClientCreate(data)
      .then(response => {
        onConfirm();
        if (callback) return callback(response.data.id);
        navigate(`/clients/${response.data.id}`);
      })
      .catch(({ response: { data } }) => {
        for (const key in data.field_errors) {
          setError(key, { type: 'custom', message: data.field_errors[key] });
        }
      })
      .finally(() => setLoading(false));
  };

  const onPhoneCountryChange = (label, index) => {
    if (index === 0) {
      setValue('username', `${label.replace(/[+ ]/g, '')}${phones[0].number}`);
    }
  };

  const onPhoneNumberChange = (e, index) => {
    if (index === 0) {
      const country = phones[0].country ? phones[0].country.label.replace(/[+ ]/g, '') : '';
      setValue('username', `${country}${e.target.value}`);
    }
  };

  return (
    <Modal
      close={() => setCancelModalOpen(true)}
      title={t('modalCreateClient')}
      isOpen={isOpen}
      contentStyle={{ maxWidth: 804, width: '100%' }}
    >
      <ModalAction
        isOpen={backModalOpen}
        title={t('modalConfirmLabelText')}
        onSubmit={() => {
          onConfirm();
          backConfirmResolve();
          close();
          reset();
        }}
        onCancel={cancelBack}
      />
      <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={s.body}>
          <div className={s.bodyItem}>
            <Input
              register={register}
              errors={errors?.last_name?.message}
              name="last_name"
              labelText={`${t('modalCreateClientSurname').toLowerCase()}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <Input
              register={register}
              errors={errors?.name?.message}
              name="name"
              labelText={`${t('modalCreateClientName').toLowerCase()}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <Input
              register={register}
              errors={errors?.otchestvo?.message}
              name="otchestvo"
              labelText={`${t('modalCreateClientOtchestvo').toLowerCase()}:`}
              placeholder={t('modalCreateClientPlaceholderRequired')}
            />
            <DatePicker
              errors={errors?.birth_date?.message}
              name="birth_date"
              labelText={`${t('modalCreateClientBirthday')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
              control={control}
            />
            <SelectCustom
              labelText={`${t('modalCreateClientCountry')}:`}
              control={control}
              error={errors?.country?.message}
              name="country"
              placeholder={t('selectRequired')}
              options={phoneCode?.map(item => ({
                label: item.name,
                value: item.id,
              }))}
            />
            <Input
              register={register}
              errors={errors?.address?.message}
              name="address"
              labelText={`${t('modalCreateClientAddress')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <Input
              register={register}
              errors={errors?.company?.message}
              name="company"
              labelText={`${t('modalCreateClientCompany')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <Input
              register={register}
              labelText={`${t('modalCreateClientCodeClient')}:`}
              name="code"
              errors={errors?.code?.message}
              inputDisabled
              lined
            />
          </div>
          <div className={s.bodyItem}>
            {fields.map((field, index) => (
              <div key={field.id}>
                <div className={s.phoneGrid}>
                  <SelectCustom
                    labelText={`${t('modalCreateClientCodeCountry')}:`}
                    control={control}
                    placeholder="----"
                    error={errors?.phones?.[index]?.country?.message}
                    name={`phones.${index}.country`}
                    options={phoneCode?.map(item => ({
                      label: item.phone_code,
                      value: item.id,
                    }))}
                    onChange={({ label }) => onPhoneCountryChange(label, index)}
                  />
                  <div>
                    <Input
                      iconClick={() => remove(index)}
                      iconId={index > 0 ? 'trash' : null}
                      register={register}
                      errors={errors?.phones?.[index]?.number?.message}
                      name={`phones.${index}.number`}
                      labelText={`${t('modalCreateClientPhone')}:`}
                      placeholder="--- -- -- --"
                      onChange={e => onPhoneNumberChange(e, index)}
                    />
                  </div>
                </div>
                <SelectCustom
                  labelText={`${t('modalCreateClientPhoneType')}:`}
                  control={control}
                  placeholder={t('selectRequired')}
                  error={errors?.phones?.[index]?.phone_type?.message}
                  name={`phones.${index}.phone_type`}
                  options={phoneType?.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                />
              </div>
            ))}
            <div
              className={s.addPhone}
              onClick={() => {
                append({
                  country: defaultCountryCode.current,
                  number: '',
                  phone_type: -1,
                });
              }}
            >
              <Icon iconClass={s.addPhoneIcon} iconId="plusCircle" />
              {t('modalCreateClientPhoneAdd')}
            </div>
            <Input
              register={register}
              errors={errors?.username?.message}
              name="username"
              labelText={`${t('modalCreateClientLogin')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <Input
              register={register}
              errors={errors?.password?.message}
              name="password"
              labelText={`${t('modalCreateClientPassword')}:`}
            />
          </div>
        </div>
        <Button
          disabled={loading}
          type="button"
          isBlue
          value={t('modalCreateClientCreate')}
          style={
            window.innerWidth > 1440 ? { margin: '40px 0 0 auto' } : { margin: '24px 0 0 auto' }
          }
        />
      </form>
    </Modal>
  );
});
