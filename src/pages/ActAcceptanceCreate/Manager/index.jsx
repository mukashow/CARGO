import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  fetchClientContractType,
  fetchClientInfoByCode,
  fetchClientsDirectionList,
  fetchTransportationType,
  managerCreateGoodsAcceptanceAct,
} from '@/store/actions';
import * as yup from 'yup';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Button, Header, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import { Form } from './components/Form';

export const ManagerActAcceptanceCreate = ErrorBoundaryHoc(() => {
  const clientInfo = useSelector(state => state.clients.clientInfo);
  const [loading, setLoading] = useState(false);
  const [payers, setPayers] = useState([]);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [backModalOpen, backConfirmResolve, cancelBack] = useConfirmNavigate();

  const selectSchema = yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.number().required(),
    })
    .default(undefined)
    .required(t('fieldShouldBeFilled'))
    .nullable();
  const validationSchema = yup.object({
    receiver: selectSchema,
    transportation_type: selectSchema,
    payer: selectSchema,
    contract_type: selectSchema,
    direction: selectSchema,
    insurance_sum: yup.lazy(value =>
      value === ''
        ? yup.string()
        : yup
            .number()
            .typeError(t('enterNumber'))
            .min(0, t('canNotBeNegative'))
            .nullable()
            .transform((_, originalValue) => Number(String(originalValue).replace(/,/g, '.')))
    ),
  });

  const resolver = useYupValidationResolver(validationSchema);
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setValue,
    setError,
    watch,
    trigger,
  } = useForm({
    resolver,
    defaultValues: {
      receiver: null,
      sender: null,
      transportation_type: null,
      payer: null,
      contract_type: null,
      direction: null,
      insurance_sum: '',
    },
  });
  const payerKey = watch('payer');
  const receiver = watch('receiver');
  const sender = watch('sender');

  const handleCreateAcceptance = values => {
    setLoading(true);
    dispatch(managerCreateGoodsAcceptanceAct(values))
      .unwrap()
      .then(data =>
        navigate(`/goods_act_acceptance/${data.id}`, { state: { path: state?.path || '/' } })
      )
      .catch(errors => {
        for (const error in errors) {
          setError(error, { type: 'custom', message: errors[error] });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (receiver) {
      const fetchDirectionList = ({ data }) => {
        dispatch(fetchClientsDirectionList({ id: data.id }))
          .unwrap()
          .then(() => setValue('direction', null))
          .catch(message => setError('direction', message));
      };

      dispatch(fetchClientInfoByCode({ code: receiver.code, type: 'receiver' }))
        .unwrap()
        .then(fetchDirectionList)
        .catch(message => setError('receiver', message));
    }
  }, [receiver]);

  useEffect(() => {
    if (sender) {
      dispatch(fetchClientInfoByCode({ code: sender.code, type: 'sender' }))
        .unwrap()
        .catch(message => setError('sender', message));
    }
  }, [sender]);

  useEffect(() => {
    if (payerKey) {
      dispatch(fetchClientContractType(payerKey.value))
        .unwrap()
        .then(res => {
          setValue('contract_type', res[0]);
          trigger('contract_type');
        })
        .catch(message => setError('contract_type', message));
    }
  }, [payerKey]);

  useEffect(() => {
    const setPayerKey = (clientId, clientType) => {
      const option = { label: t(clientType), value: clientId, type: clientType };

      setPayers(state => [...state.filter(({ type }) => type !== clientType), option]);
      if (payerKey?.type === clientType || !payerKey) {
        setValue('payer', option);
        trigger('payer');
      }
    };

    if (clientInfo.receiver) {
      setPayerKey(clientInfo.receiver.id, 'receiver');
    }
    if (clientInfo.sender) {
      setPayerKey(clientInfo.sender.id, 'sender');
    }
  }, [clientInfo]);

  useEffect(() => {
    dispatch(fetchTransportationType())
      .unwrap()
      .then(res => setValue('transportation_type', res[0]))
      .catch(message => setError('transportation_type', message));
  }, []);

  return (
    <>
      <ModalAction
        isOpen={backModalOpen}
        title={t('cancelActCreation')}
        description={t('cancelActCreationDescription')}
        onSubmit={backConfirmResolve}
        onCancel={cancelBack}
      />
      <Header title={t('cargoAcceptanceAct')} />
      <Box style={{ flexGrow: 0 }}>
        <div className={s.content}>
          <div className={s.formWrap}>
            <Form
              errors={errors}
              receiver={receiver}
              control={control}
              payers={payers}
              register={register}
              setValue={setValue}
            />
          </div>
        </div>
      </Box>
      <div className={s.footer}>
        <Button
          value={t('modalCreateClientCreate')}
          onClick={handleSubmit(handleCreateAcceptance)}
          disabled={loading}
          isBlue
        />
        <Button value={t('cancel')} onClick={() => navigate(-1)} />
      </div>
    </>
  );
});
