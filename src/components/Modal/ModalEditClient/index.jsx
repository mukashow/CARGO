import s from './index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchClient, fetchClients, getClientUpdate } from '@/store/actions';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as yup from 'yup';
import {
  Button,
  DatePicker,
  ErrorBoundaryHoc,
  Input,
  Modal,
  ModalAction,
  SelectCustom,
} from '@/components';
import { useConfirmNavigate } from '@hooks';

dayjs.extend(customParseFormat);

export const ModalEditClient = ErrorBoundaryHoc(({ isOpen, close }) => {
  const client = useSelector(state => state.clients.client);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { clientId } = useParams();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [backModalOpen, backConfirmResolve, cancelBack, setCancelModalOpen] =
    useConfirmNavigate(isOpen);

  const validationSchema = yup.object({
    last_name: yup
      .string()
      .required(t('modalCreateClientRequired'))
      .min(1, 'Не меньше 1 символов')
      .max(50, 'Не больше 50 символов'),
    name: yup
      .string()
      .required(t('modalCreateClientRequired'))
      .min(1, 'Не меньше 1 символов')
      .max(50, 'Не больше 50 символов'),
    otchestvo: yup.string().max(50, 'Не больше 50 символов'),
    birth_date: yup.string().required(t('modalCreateClientRequired')),
    address: yup.string().max(256, 'Не больше 256 символов'),
    company: yup.string().max(127, 'Не больше 127 символов'),
    country: yup.object().required(t('modalCreateClientRequired')).nullable(),
    code: yup.string().required(t('modalCreateClientRequired')),
    username: yup
      .string()
      .required(t('modalCreateClientRequired'))
      .max(20, 'Не больше 20 символов'),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (client) {
      reset({
        last_name: client.last_name,
        name: client.name,
        otchestvo: client.otchestvo,
        birth_date: client.birth_date ? dayjs(client?.birth_date, 'DD.MM.YYYY').toDate() : '',
        country: { value: client.country, label: client.country_name },
        address: client.address,
        company: client.company,
        code: client.code,
        username: client.username,
      });
    }
  }, [client]);

  const onConfirm = () => {
    setCancelModalOpen(false);
    close();
  };

  const onSubmit = data => {
    setLoading(true);
    data = { ...data, birth_date: dayjs(data.birth_date).format('DD.MM.YYYY') };
    getClientUpdate(client.id, data)
      .then(({ id }) => {
        toast.success('Успешно выполнено');
        onConfirm();
        if (pathname === '/clients') dispatch(fetchClients(searchParams));
        if (clientId) dispatch(fetchClient(id));
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={t('modalCreateClientEditLabel')}
      isOpen={isOpen}
      close={() => setCancelModalOpen(true)}
      contentStyle={{ maxWidth: 804, width: '100%' }}
    >
      <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={s.body}>
          <div className={s.bodyItem}>
            <Input
              register={register}
              errors={errors?.last_name?.message}
              required
              name="last_name"
              labelText={`${t('modalCreateClientSurname')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <Input
              register={register}
              errors={errors?.name?.message}
              required
              name="name"
              labelText={`${t('modalCreateClientName')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <Input
              register={register}
              errors={errors?.otchestvo?.message}
              name="otchestvo"
              labelText={`${t('modalCreateClientOtchestvo')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <DatePicker
              labelText={`${t('modalCreateClientBirthday')}:`}
              errors={errors?.birth_date?.message}
              name="birth_date"
              control={control}
              placeholder={t('modalCreateClientPlaceholder')}
            />
            <SelectCustom
              labelText={`${t('modalCreateClientCountry')}:`}
              control={control}
              error={errors?.country?.message}
              isDisabled
              lined
              placeholder={null}
              name="country"
              options={[]}
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
          </div>
          <div className={s.bodyItem}>
            <Input
              labelText={`${t('modalCreateClientCodeClient')}:`}
              name="code"
              register={register}
              errors={errors?.code?.message}
              inputDisabled
              lined
            />
            <Input
              register={register}
              errors={errors?.username?.message}
              required
              name="username"
              labelText={`${t('modalCreateClientLogin')}:`}
              placeholder={t('modalCreateClientPlaceholder')}
            />
          </div>
        </div>
        <Button
          disabled={loading}
          type="button"
          isBlue
          value={t('modalCreateClientEdit')}
          style={
            window.innerWidth > 1440 ? { margin: '40px 0 0 auto' } : { margin: '24px 0 0 auto' }
          }
        />
      </form>
      <ModalAction
        isOpen={backModalOpen}
        title={t('toCancelClientEdition')}
        onSubmit={() => {
          onConfirm();
          backConfirmResolve();
          close();
          reset();
        }}
        onCancel={cancelBack}
      />
    </Modal>
  );
});
