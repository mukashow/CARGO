import s from '../index.module.scss';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchClient, getDeletePhone, getUpdatePhone } from '@/store/actions';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { ErrorBoundaryHoc, Icon, Input, SelectCustom } from '@/components';

export const Phone = ErrorBoundaryHoc(({ item, index }) => {
  const { t } = useTranslation();
  const [addPhone, setAddPhone] = useState(false);
  const validationSchema = yup.object({
    country: yup.object().required(t('modalCreateClientRequired')).nullable(),
    number: yup.string().required(t('modalCreateClientRequired')).max(25, 'Не больше 25 символов'),
    phone_type: yup.object().required(t('modalCreateClientRequired')).nullable(),
  });
  const dispatch = useDispatch();
  const { clientId } = useParams();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      country: { value: item.country, label: item.country_code },
      number: item.number,
      phone_type: { value: item.phone_type, label: item.phone_type_name },
    },
  });
  const phoneCode = useSelector(state => state.phone.phoneCode);
  const phoneType = useSelector(state => state.phone.phoneType);
  const createPhone = data => {
    getUpdatePhone(clientId, item.id, data).then(response => {
      dispatch(fetchClient(clientId));
      setAddPhone(false);
    });
  };
  const deletePhone = () => {
    getDeletePhone(clientId, item.id).then(() => {
      dispatch(fetchClient(clientId));
    });
  };
  return (
    <>
      <div className={s.row} style={{ paddingRight: 70 }}>
        <div className={s.rowLabel}>{t('clientPhone')}:</div>
        <div className={s.rowValue}>
          {item.country_code} {item.number} ({item.phone_type_name})
        </div>
        {index !== 0 && !addPhone && (
          <div className={s.delete} onClick={deletePhone}>
            <Icon iconClass={s.addRowIcon} iconId="trash" iconWidth={24} iconHeight={24} />
          </div>
        )}

        {!addPhone && (
          <div className={s.edit} onClick={() => setAddPhone(true)}>
            <Icon iconClass={s.addRowIcon} iconId="edit" iconWidth={24} iconHeight={24} />
          </div>
        )}
      </div>
      {addPhone && (
        <form onSubmit={handleSubmit(createPhone)} className={s.formPhoneDetail}>
          <div className={s.phoneDetail}>
            <SelectCustom
              options={phoneCode?.map(item => ({
                label: item.phone_code,
                value: item.id,
              }))}
              placeholder="----"
              name="country"
              control={control}
              error={errors.country?.message}
            />
            <Input
              placeholder="--- -- -- --"
              name="number"
              register={register}
              errors={errors?.number?.message}
            />
            <SelectCustom
              options={phoneType?.map(item => ({
                label: item.name,
                value: item.id,
              }))}
              placeholder={t('modalCreateClientPlaceholderSelectRequired')}
              name="phone_type"
              control={control}
              error={errors.phone_type?.message}
            />
          </div>
          <div className={s.buttons}>
            <div className={s.buttonCancel} onClick={() => setAddPhone(false)}>
              <Icon iconId="cross" />
            </div>
            <button type="submit" className={s.buttonSuccess}>
              <Icon iconId="access" />
            </button>
          </div>
        </form>
      )}
    </>
  );
});
