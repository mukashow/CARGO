import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchClient, fetchClientContractType, setContractType } from '@/store/actions';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { ErrorBoundaryHoc, Icon, SelectCustom } from '@/components';

export const ContractType = ErrorBoundaryHoc(() => {
  const { t } = useTranslation();
  const client = useSelector(state => state.clients.client);
  const clientContractType = useSelector(state => state.clients.clientContractType);
  const [addType, setAddType] = useState(false);
  const dispatch = useDispatch();
  const validationSchema = yup.object({
    contract_type: yup.object().required(t('modalCreateClientRequired')).nullable(),
  });
  const { clientId } = useParams();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      contract_type: {
        label: client.default_contract_type_name,
        value: client.default_contract_type,
      },
    },
  });

  useEffect(() => {
    dispatch(fetchClientContractType(clientId));
  }, []);

  const editType = data => {
    setContractType(clientId, data.contract_type.value).then(() => {
      setAddType(false);
      dispatch(fetchClient(clientId));
    });
  };
  const closeType = () => {
    setAddType(false);
    reset();
  };

  return (
    <>
      <div className={s.row}>
        <div className={s.rowLabel}>{t('clientContractType')}:</div>
        <div className={s.rowValue}>{client.default_contract_type_name}</div>
        {!addType && (
          <div className={s.edit} onClick={() => setAddType(true)}>
            <Icon iconId="edit" />
          </div>
        )}
      </div>
      {addType && (
        <form onSubmit={handleSubmit(editType)} className={s.formDocTypeDetail}>
          <div className={s.docTypeDetail}>
            <SelectCustom
              options={clientContractType || []}
              name="contract_type"
              control={control}
              error={errors.contract_type?.message}
              placeholder={null}
            />
          </div>
          <div className={s.buttons}>
            <div className={s.buttonCancel} onClick={() => closeType()}>
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
