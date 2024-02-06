import s from '../ActAcceptanceCreate/index.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchClientContractType,
  fetchClientInfoByCode,
  fetchClientsDirectionList,
  fetchManagerGoodsAcceptanceInfo,
  fetchTransportationType,
  updateGoodsAcceptanceAct,
} from '@/store/actions';
import * as yup from 'yup';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Button, Header, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import { Form } from './components/Form';

export const ActAcceptanceEdit = ErrorBoundaryHoc(() => {
  const clientInfo = useSelector(state => state.clients.clientInfo);
  const goodsDetail = useSelector(state => state.goods.goodsDetail);
  const roleId = useSelector(state => state.auth.user?.role_id);
  const [loading, setLoading] = useState(false);
  const [payers, setPayers] = useState([]);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actId } = useParams();
  const isFirstLoad = useRef(true);
  const isFirstDirectionLoad = useRef(true);
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
    sender: selectSchema,
    transportation_type: selectSchema,
    payer: selectSchema,
    contract_type: selectSchema,
    direction: selectSchema,
    insurance_sum: yup.lazy(value =>
      value === ''
        ? yup.string()
        : yup.number().typeError(t('enterNumber')).min(0, t('canNotBeNegative')).nullable()
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
  } = useForm({
    resolver,
    defaultValues: {
      receiver: null,
      sender: null,
      transportation_type: null,
      payer: null,
      contract_type: null,
      direction: null,
      insurance_sum: null,
    },
  });

  const payerKey = watch('payer');
  const receiver = watch('receiver');
  const sender = watch('sender');

  const handleUpdateAcceptance = values => {
    setLoading(true);
    dispatch(updateGoodsAcceptanceAct({ ...values, actId }))
      .unwrap()
      .then(() => navigate(`/goods_act_acceptance/${actId}`))
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
        dispatch(
          fetchClientsDirectionList({
            id: data.id,
            warehouse: roleId === 5 ? goodsDetail?.warehouse.id : null,
          })
        )
          .unwrap()
          .then(() => {
            if (isFirstDirectionLoad.current) {
              isFirstDirectionLoad.current = false;
              return;
            }
            setValue('direction', null);
          })
          .catch(message => setError('direction', message));
      };

      dispatch(fetchClientInfoByCode({ code: receiver.label, type: 'receiver' }))
        .unwrap()
        .then(fetchDirectionList)
        .catch(message => setError('receiver', message));
    }
  }, [receiver]);

  useEffect(() => {
    if (sender) {
      dispatch(fetchClientInfoByCode({ code: sender.label, type: 'sender' }))
        .unwrap()
        .catch(message => setError('sender', message));
    }
  }, [sender]);

  useEffect(() => {
    if (payerKey) {
      dispatch(fetchClientContractType(payerKey.value))
        .unwrap()
        .then(res => setValue('contract_type', res[0]))
        .catch(message => setError('contract_type', message));
    }
  }, [payerKey]);

  useEffect(() => {
    const setPayerKey = (clientId, clientType) => {
      const option = { label: t(clientType), value: clientId, type: clientType };

      setPayers(state => [...state.filter(({ type }) => type !== clientType), option]);
      if (payerKey?.type === clientType || !payerKey) {
        setValue('payer', option);
      }
    };

    if (!clientInfo.sender || !clientInfo.receiver) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (clientInfo.receiver) {
      setPayerKey(clientInfo.receiver.id, 'receiver');
    }
    if (clientInfo.sender) {
      setPayerKey(clientInfo.sender.id, 'sender');
    }
  }, [clientInfo]);

  useEffect(() => {
    dispatch(fetchManagerGoodsAcceptanceInfo({ id: actId }))
      .unwrap()
      .then(({ receiver, sender, transportation_type, payer, direction, insurance_sum }) => {
        setValue('receiver', { label: receiver.code, value: receiver.id });
        setValue('transportation_type', {
          label: transportation_type.name,
          value: transportation_type.id,
        });
        const payers = [{ label: t('receiver'), value: receiver.id, type: 'receiver' }];
        if (sender) {
          setValue('sender', { label: sender.code, value: sender.id });
          payers.push({ label: t('sender'), value: sender.id, type: 'sender' });
        }
        setPayers(payers);
        setValue(
          'payer',
          payers.find(({ value }) => value === payer)
        );
        setValue('direction', {
          label: `${direction.point_from_name} - ${
            direction.custom_clearance_country_name
              ? `${direction.custom_clearance_country_name} - `
              : ''
          }${direction.point_to_name}`,
          value: direction.id,
        });
        setValue('insurance_sum', insurance_sum);
      });
    dispatch(fetchTransportationType())
      .unwrap()
      .catch(message => setError('transportation_type', message));
  }, []);

  return (
    <div>
      <ModalAction
        isOpen={backModalOpen}
        title={t('cancelEditAct')}
        description={t('cancelEditActDescription')}
        onSubmit={backConfirmResolve}
        onCancel={cancelBack}
      />
      <Header
        title={`${t('acceptanceReport')} #${actId}`}
        status={goodsDetail?.status_name}
        statusId={goodsDetail?.status_id}
        statusAuthor={`${goodsDetail?.creator_name} ${goodsDetail?.creator_last_name}`}
        statusDate={goodsDetail?.created_at.slice(0, 10)}
      />
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
          value={t('save')}
          isOrange
          onClick={handleSubmit(handleUpdateAcceptance)}
          disabled={loading}
          isBlue
        />
        <Button value={t('cancel')} onClick={() => navigate(-1)} />
      </div>
    </div>
  );
});
