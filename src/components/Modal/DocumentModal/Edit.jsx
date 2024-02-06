import s from './index.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import {
  addFileToDocument,
  fetchAllContainerDocumentTypes,
  fetchContainerDocuments,
  fetchContainerOne,
  fetchDocument,
  fetchDocumentDocTypes,
  fetchDocumentDocuments,
  fetchUserDocuments,
  fetchUsersDocumentsType,
  updateDocument,
} from '@actions';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import { Files } from './components/Files';

export const ModalEditDocument = ErrorBoundaryHoc(({ isOpen, close, id, clientId, type }) => {
  const [fileStatus, setFileStatus] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState(null);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [backModalOpen, confirmBack, backCancel] = useConfirmNavigate(isOpen);

  const validationSchema = yup.object({
    files: yup
      .array()
      .min(1, t('needAttachFile'))
      .test('isValid', '', (value, { createError }) => {
        if (value.length > doc?.doc_type_max_count) {
          return createError({
            message: i18n.language.match(/ru|ru-RU/)
              ? `К этому документу можно прикрепить не больше ${doc.doc_type_max_count} файлов`
              : `No more than ${doc.doc_type_max_count} files can be attached to this document`,
            path: 'files',
          });
        }
        return true;
      }),
  });
  const {
    setValue,
    trigger,
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
    watch,
  } = useForm({
    resolver: useYupValidationResolver(validationSchema),
    defaultValues: { comment: null, files: [] },
  });
  const { append, remove, fields } = useFieldArray({
    control,
    name: 'files',
  });
  const comment = watch('comment');
  const commentRef = useRef(null);

  const onConfirm = () => {
    setFileStatus([]);
    setConfirmOpen(false);
    close();
    reset({ comment: null, files: [] });
  };

  const onSubmit = useCallback(
    async data => {
      setLoading(true);
      let newFileStatus;
      if (fileStatus.length) {
        newFileStatus = fileStatus.map(status => (status === 'success' ? status : 'loading'));
      } else {
        newFileStatus = data.files.map(({ fileId }) => (!!fileId ? 'success' : 'loading'));
      }

      if (data.comment !== doc.comment) {
        await dispatch(updateDocument({ id, clientId, comment: data.comment }));
      }
      dispatch(
        addFileToDocument({
          files: data.files,
          document_id: id,
          clientId,
          fileStatus: newFileStatus,
          setFileStatus,
        })
      )
        .unwrap()
        .then(onConfirm)
        .catch(() => toast.error(t('couldNotSaveFiles')))
        .finally(() => {
          switch (type) {
            case 'document':
              dispatch(fetchDocumentDocuments(clientId));
              dispatch(fetchDocumentDocTypes(clientId));
              break;
            case 'container':
              dispatch(fetchContainerDocuments(clientId));
              dispatch(fetchAllContainerDocumentTypes(clientId));
              dispatch(fetchContainerOne(clientId));
              break;
            default:
              dispatch(fetchUserDocuments(clientId));
              dispatch(fetchUsersDocumentsType(clientId));
          }
          setLoading(false);
        });
      setFileStatus(newFileStatus);
    },
    [fileStatus, clientId, id, doc]
  );

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDocument(id))
        .unwrap()
        .then(data => {
          setDoc(data);
          setValue('comment', data.comment);
          commentRef.current.style.height = `${commentRef.current.scrollHeight + 2}px`;
          setValue(
            'files',
            data.files.map(item => ({ ...item, file: { name: item.name }, fileId: item.id }))
          );
        });
    } else {
      setDoc(null);
    }
  }, [id, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      title={t('tableDoc')}
      close={() => (loading ? () => {} : setConfirmOpen(true))}
      contentStyle={{ width: 422 }}
    >
      <form
        className={s.form}
        onSubmit={handleSubmit(onSubmit)}
        style={{
          pointerEvents: fileStatus.some(status => status === 'loading') ? 'none' : 'unset',
        }}
      >
        <SelectCustom
          value={{ value: 0, label: doc?.doc_type_name }}
          isDisabled
          labelText={t('tableDocType') + ':'}
          blue
          lined
        />
        <Input
          register={register}
          multiline
          name="comment"
          labelText={t('tableDocComment') + ':'}
          errors={
            comment?.length === 1000 && dirtyFields.comment && `${t('maxCharactersLength')} ${1000}`
          }
          onInput={e => {
            if (e.target.value.length > 1000) {
              e.target.value = e.target.value.slice(0, 1000);
            }
          }}
          passRef={commentRef}
        />
        <Files
          type={type}
          clientId={clientId}
          docId={id}
          trigger={trigger}
          append={append}
          files={fields}
          status={fileStatus}
          setStatus={setFileStatus}
          remove={remove}
          errors={errors}
          docType={doc}
        />
        <div className={s.buttons}>
          <Button
            value={t('save')}
            isBlue
            type="button"
            style={{ marginLeft: 'auto' }}
            disabled={loading}
          />
        </div>
      </form>
      <ModalAction
        isOpen={confirmOpen || backModalOpen}
        title={t('toCancelDocEditing')}
        onCancel={() => {
          setConfirmOpen(false);
          if (backModalOpen) backCancel();
        }}
        description={t('toCancelDocCreationDescription')}
        onSubmit={() => {
          onConfirm();
          if (backModalOpen) confirmBack();
        }}
      />
    </Modal>
  );
});
