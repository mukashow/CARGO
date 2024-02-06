import React, { useEffect, useState } from 'react';
import s from '../index.module.scss';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { Header, Box, ModalAction, Button } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Form } from './components/Form';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import {
  storekeeperCreateGoodsAcceptanceAct,
  fetchClientInfoByCode,
  fetchClientsDirectionList,
  fetchTransportationType,
} from '@actions/index';

export const StorekeeperActAcceptanceCreate = ErrorBoundaryHoc(() => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [backModalOpen, backConfirmResolve, cancelBack] = useConfirmNavigate();

  const selectSchema = yup.object().required(t('fieldShouldBeFilled')).nullable();
  const validationSchema = yup.object({
    receiver: selectSchema,
    transportation_type: selectSchema,
    direction: selectSchema,
  });

  const resolver = useYupValidationResolver(validationSchema);
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver,
    defaultValues: {
      receiver: null,
      sender: null,
      transportation_type: null,
      direction: null,
    },
  });
  const receiver = watch('receiver');
  const sender = watch('sender');

  const handleCreateAcceptance = values => {
    setLoading(true);
    dispatch(storekeeperCreateGoodsAcceptanceAct(values))
      .unwrap()
      .then(data => navigate(`/goods_act_acceptance/${data.id}`, { state: { path: state.path } }))
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
            <Form errors={errors} receiver={receiver} control={control} />
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
