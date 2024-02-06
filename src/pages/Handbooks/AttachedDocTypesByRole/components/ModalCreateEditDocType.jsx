import s from '../index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  changeDocTypeByRole,
  fetchAllDocTypes,
  fetchAllRoles,
  fetchDocTypesByRole,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditDocType = ErrorBoundaryHoc(({ isOpen, close, mode = 'create' }) => {
  const docTypeList = useSelector(state => state.documents.docTypesList);
  const docTypesByRole = useSelector(state => state.documents.docTypesByRole);
  const docType = useSelector(state => state.documents.docTypeByRoleOne);
  const roles = useSelector(state => state.users.allRoles);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const docTypes = useMemo(() => {
    if (!docTypeList || !docTypesByRole) return [];
    return docTypeList.filter(({ id }) => {
      const leaveCurrentDocType = mode === 'edit' && docType?.id === id;
      const exists = docTypesByRole.results.some(doc => doc.id === id);
      return leaveCurrentDocType || !exists;
    });
  }, [docTypeList, docTypesByRole, docType]);

  const schema = yup.object({
    document_type: yup.object().required(t('fieldShouldBeFilled')),
    role_list: yup.array().test({
      message: t('fieldShouldBeFilled'),
      test: arr => arr?.length !== 0,
    }),
  });
  const resolver = useYupValidationResolver(schema);
  const {
    formState: { errors },
    reset,
    control,
    handleSubmit,
    setError,
    setValue,
  } = useForm({ resolver, defaultValues: { role_list: [] } });

  const onSubmit = async values => {
    setLoading(true);
    try {
      await dispatch(changeDocTypeByRole(values)).unwrap();
      dispatch(fetchDocTypesByRole(searchParams));
      reset();
      close();
    } catch (errors) {
      for (const key in errors) {
        setError(key, { message: errors[key] });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (docType && mode === 'edit') {
      const { id, name, role_list } = docType;
      setValue('document_type', { id, name });
      setValue('role_list', role_list);
    }
  }, [docType]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllDocTypes());
      dispatch(fetchAllRoles());
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      close={() => setCancelConfirm(true)}
      title={t('attachedDocsByUsersTypes')}
      contentStyle={{ width: 422 }}
    >
      <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
        {mode === 'create' ? (
          <SelectCustom
            labelText={`${t('tableDocType')}:`}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            placeholder={t('selectRequired')}
            control={control}
            getOptionValue={option => option.id}
            getOptionLabel={option => option.name}
            name="document_type"
            options={docTypes}
            error={errors.document_type?.message}
          />
        ) : (
          <Input labelText={`${t('tableDocType')}:`} placeholder={docType?.name} disabled lined />
        )}
        <SelectCustom
          labelText={`${t('userRoles').toLowerCase()}:`}
          control={control}
          showCheckbox
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          placeholder={t('selectRequired')}
          blurInputOnSelect={false}
          getOptionValue={option => option.id}
          getOptionLabel={option => option.name}
          name="role_list"
          options={roles}
          error={errors.role_list?.message}
        />
        <div className={s.footer}>
          <Button
            onClick={() => setCancelConfirm(true)}
            textButton
            value={t('modalConfirmLabelCancel')}
            style={{ fontSize: 16 }}
          />
          <Button
            value={t(mode === 'create' ? 'modalConfirmLabelConfirm' : 'save')}
            isBlue={mode === 'create'}
            green={mode === 'edit'}
            type="button"
            disabled={loading}
          />
        </div>
      </form>
      <ModalAction
        title={t(
          mode === 'create'
            ? 'toCancelAttachedDocTypeByRoleCreation'
            : 'toCancelAttachedDocTypeByRoleEditing'
        )}
        description={t('attachedDocTypeByRoleDataWillNotBeSaved')}
        isOpen={cancelConfirm || backModalOpen}
        onCancel={() => {
          setCancelConfirm(false);
          onCancel();
        }}
        onSubmit={() => {
          setCancelConfirm(false);
          backConfirm();
          reset();
          close();
        }}
      />
    </Modal>
  );
});
