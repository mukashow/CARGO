import s from '../index.module.scss';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchClient, getCreatePhone } from '@/store/actions';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { ErrorBoundaryHoc, Icon, Input, SelectCustom } from '@/components';
import { ContractType, Phone } from './index';

export const DetailedClient = ErrorBoundaryHoc(() => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const validationSchema = yup.object({
    country: yup.object().required(t('modalCreateClientRequired')).nullable(),
    number: yup.string().required(t('modalCreateClientRequired')).max(25, 'Не больше 25 символов'),
    phone_type: yup.object().required(t('modalCreateClientRequired')).nullable(),
  });
  const { clientId } = useParams();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const client = useSelector(state => state.clients.client);
  const phoneCode = useSelector(state => state.phone.phoneCode);
  const phoneType = useSelector(state => state.phone.phoneType);
  const [addPhone, setAddPhone] = useState(false);

  const createPhone = data => {
    getCreatePhone(clientId, data).then(response => {
      dispatch(fetchClient(clientId));
      setAddPhone(false);
      reset();
    });
  };

  return (
    <div className={s.content}>
      <div className={s.head}>
        <div className={s.badge}>{client.role_name}</div>
      </div>
      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientCodeClient')}:</div>
        <div className={s.rowValue}>{client.code}</div>
      </div>
      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientFullName')}:</div>
        <div className={s.rowValue}>
          {client.last_name} {client.name} {client.otchestvo}
        </div>
      </div>
      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientCountry')}:</div>
        <div className={s.rowValue}>{client.country_name}</div>
      </div>
      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientCompany')}:</div>
        <div className={s.rowValue}>{client.company}</div>
      </div>
      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientBirthday')}:</div>
        <div className={s.rowValue}>{client.birth_date}</div>
      </div>

      {client.phones.map((item, index) => (
        <Phone key={item.id} item={item} index={index} />
      ))}
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
            <div
              className={s.buttonCancel}
              onClick={() => {
                setAddPhone(false);
                reset();
              }}
            >
              <Icon iconId="cross" />
            </div>
            <button type="submit" className={s.buttonSuccess}>
              <Icon iconId="access" />
            </button>
          </div>
        </form>
      )}

      {!addPhone && client.phones.length <= 4 && (
        <div className={s.addRow} onClick={() => setAddPhone(true)}>
          <Icon iconClass={s.addRowIcon} iconId="plusCircle" iconWidth={24} iconHeight={24} />
          <div className={s.addRowValue}>{t('clientAddPhone')}</div>
        </div>
      )}

      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientAddress')}:</div>
        <div className={s.rowValue}>{client.address}</div>
      </div>
      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientLogin')}:</div>
        <div className={s.rowValue}>{client.username}</div>
      </div>
      <ContractType />
    </div>
  );
});
