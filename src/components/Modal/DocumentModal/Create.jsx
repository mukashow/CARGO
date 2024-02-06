import s from './index.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setUsersDocumentsType } from '@slices/documents';
import * as yup from 'yup';
import {
  Button,
  ErrorBoundaryHoc,
  Icon,
  Input,
  Modal,
  ModalAction,
  SelectCustom,
} from '@/components';
import {
  addDocToDocument,
  addDocumentToContainer,
  addFileToDocument,
  createDocument,
  fetchAllContainerDocumentTypes,
  fetchClientContractType,
  fetchContainerDocuments,
  fetchDocDependentTypes,
  fetchDocumentDocTypes,
  fetchDocumentDocuments,
  fetchUserDocuments,
  fetchUsersDocumentsType,
} from '@actions';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import { Files } from './components/Files';

export const ModalCreateDocument = ErrorBoundaryHoc(
  ({ isOpen, close, docToAttach, clientId, type }) => {
    const usersDocumentsType = useSelector(state => state.documents.usersDocumentsType);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dependentFill, setDependentFill] = useState({
      isActive: false,
      step: -1,
    });
    const [docType, setDocType] = useState(null);
    const [isFileError, setIsFileError] = useState(false);
    const [fileStatus, setFileStatus] = useState([]);
    const [backModalOpen, confirmBack, backCancel] = useConfirmNavigate(isOpen);
    const { t, i18n } = useTranslation();
    const params = useParams();
    const dispatch = useDispatch();
    const mainDocId = useRef(null);
    const dependentDocId = useRef(null);
    const commentRef = useRef(null);

    const validationSchema = yup.object({
      doc_type: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.number().required(),
        })
        .nullable()
        .required(t('requiredDocType')),
      files: yup
        .array()
        .min(1, t('needAttachFile'))
        .test('isValid', '', (value, { parent, createError }) => {
          if (value.length > parent.doc_type?.max_count) {
            return createError({
              message: i18n.language.match(/ru|ru-RU/)
                ? `К этому документу можно прикрепить не больше ${parent.doc_type?.max_count} файлов`
                : `No more than ${parent.doc_type?.max_count} files can be attached to this document`,
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
      formState: { errors },
      watch,
    } = useForm({
      resolver: useYupValidationResolver(validationSchema),
      defaultValues: {
        doc_type: null,
        comment: null,
        files: [],
      },
    });
    const { append, remove, fields } = useFieldArray({
      control,
      name: 'files',
    });
    const comment = watch('comment');

    const onConfirm = () => {
      setConfirmOpen(false);
      setFileStatus([]);
      mainDocId.current = null;
      dependentDocId.current = null;
      setDependentFill({ step: -1, isActive: false });
      setDocType(null);
      close();
      reset({
        doc_type: null,
        comment: null,
        files: [],
      });
      setIsFileError(false);
    };

    const onDocTypeChange = doc => {
      switch (type) {
        case 'document':
          dispatch(fetchDocDependentTypes(doc.value))
            .unwrap()
            .then(dependents => setDocType({ ...doc, dependents }));
          break;
        default:
          setDocType(doc);
      }
      if (fields.length) trigger('files');
    };

    const onSubmit = useCallback(
      data => {
        setLoading(true);
        const addFilesToDoc = isDependentFillMode => {
          dispatch(
            addFileToDocument({
              files: data.files,
              document_id: isDependentFillMode ? dependentDocId.current : mainDocId.current,
              clientId,
              fileStatus,
              setFileStatus,
            })
          )
            .unwrap()
            .then(() => {
              setIsFileError(false);
              const nextStep = dependentFill.step + 1;
              if (isDependentFillMode && docType.dependents.length > nextStep) {
                setDependentFill({ step: nextStep, isActive: true });
                setFileStatus([]);
                const nextDoc = docType.dependents[nextStep];
                reset({
                  doc_type: {
                    ...nextDoc,
                    label: docType.dependents[nextStep].name,
                    value: docType.dependents[nextStep].id,
                  },
                  comment: null,
                  files: [],
                });
                setDocType({
                  ...docType,
                  max_count: nextDoc.max_count,
                  max_size: nextDoc.max_size,
                });
                commentRef.current.style.height = 0;
                return;
              }
              onConfirm();
            })
            .catch(() => {
              toast.error(t('couldNotSaveFiles'));
              setIsFileError(true);
            })
            .finally(() => {
              setLoading(false);
              switch (type) {
                case 'document':
                  dispatch(fetchDocumentDocuments(clientId));
                  dispatch(fetchDocumentDocTypes(clientId));
                  break;
                case 'container':
                  dispatch(fetchContainerDocuments(clientId));
                  dispatch(fetchAllContainerDocumentTypes(clientId));
                  break;
                default:
                  dispatch(fetchUserDocuments(clientId));
                  dispatch(fetchUsersDocumentsType(clientId));
              }
              if (!!params.clientId) dispatch(fetchClientContractType(clientId));
            });
        };

        if (fileStatus.length) {
          setFileStatus(status =>
            status.map(status => (status === 'success' ? status : 'loading'))
          );
        } else {
          setFileStatus(data.files.map(() => 'loading'));
        }

        if (isFileError) {
          return addFilesToDoc(!!docType.dependents.length);
        }

        dispatch(
          dependentFill.isActive || type === 'document'
            ? addDocToDocument({
                ...data,
                docId: type === 'document' ? clientId : mainDocId.current,
              })
            : type === 'container'
            ? addDocumentToContainer({ ...data, docId: clientId })
            : createDocument({ ...data, clientId })
        )
          .unwrap()
          .then(document_id => {
            if (!dependentFill.isActive) {
              mainDocId.current = document_id;
            }
            dependentDocId.current = document_id;
            addFilesToDoc(!!docType.dependents.length);
          })
          .catch(() => {
            setFileStatus([]);
            setLoading(false);
          });
      },
      [fileStatus, dependentFill, clientId, docType]
    );

    useEffect(() => {
      if (docToAttach?.value && usersDocumentsType) {
        const docTypes = type === 'document' ? usersDocumentsType?.dependents : usersDocumentsType;
        const docType = docTypes?.find(({ id }) => id === docToAttach.value);
        if (docType) {
          const docToSet = { ...docType, label: docType.name, value: docType.id };
          switch (type) {
            case 'document':
              dispatch(fetchDocDependentTypes(docType.id))
                .unwrap()
                .then(dependents => {
                  setDocType({ ...docToSet, dependents });
                  setValue('doc_type', { ...docToSet, dependents });
                });
              break;
            default:
              setDocType(docToSet);
              setValue('doc_type', docToSet);
          }
        }
      }
    }, [docToAttach, usersDocumentsType]);

    useEffect(() => {
      return () => {
        dispatch(setUsersDocumentsType(null));
      };
    }, []);

    return (
      <Modal
        isOpen={isOpen}
        title={t('tableDoc')}
        close={loading ? () => {} : () => setConfirmOpen(true)}
        contentStyle={{ width: 422 }}
      >
        {dependentFill.isActive && (
          <div className={s.requirements}>
            <Icon iconWidth={16} iconHeight={16} iconId="alert" />
            {t('attachFileReq')} {docType.dependents[dependentFill.step].name}
          </div>
        )}
        <form
          className={s.form}
          onSubmit={handleSubmit(onSubmit)}
          style={{
            pointerEvents: fileStatus.some(status => status === 'loading') ? 'none' : 'unset',
          }}
        >
          <SelectCustom
            options={(type === 'document'
              ? usersDocumentsType?.dependents
              : usersDocumentsType
            )?.map(({ name, id, ...rest }) => ({
              label: name,
              value: id,
              ...rest,
            }))}
            onChange={onDocTypeChange}
            isDisabled={dependentFill.isActive || docToAttach || isFileError}
            lined={dependentFill.isActive || docToAttach}
            control={control}
            name="doc_type"
            labelText={t('tableDocType') + ':'}
            blue
            placeholder=""
            error={errors.doc_type?.message}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          <Input
            register={register}
            multiline
            name="comment"
            labelText={t('tableDocComment') + ':'}
            errors={comment?.length === 1000 && `${t('maxCharactersLength')} ${1000}`}
            disabled={isFileError}
            onInput={e => {
              if (e.target.value.length > 1000) {
                e.target.value = e.target.value.slice(0, 1000);
              }
            }}
            passRef={commentRef}
          />
          <Files
            trigger={trigger}
            append={append}
            files={fields}
            status={fileStatus}
            setStatus={setFileStatus}
            remove={remove}
            errors={errors}
            docType={docType}
          />
          <div className={s.buttons}>
            {dependentFill.isActive && (
              <Button
                value={t('skip')}
                textButton
                style={{ fontSize: 16 }}
                onClick={() => setConfirmOpen(true)}
                disabled={loading}
              />
            )}
            <Button
              value={t(
                !docType?.dependents?.length ||
                  docType.dependents?.length - 1 === dependentFill.step
                  ? 'save'
                  : 'further'
              )}
              isBlue
              type="button"
              style={{ marginLeft: 'auto' }}
              disabled={loading}
            />
          </div>
        </form>
        <ModalAction
          isOpen={confirmOpen || backModalOpen}
          title={dependentFill.isActive ? t('toAttachFileLater') : t('toCancelDocCreation')}
          onCancel={() => {
            setConfirmOpen(false);
            if (backModalOpen) backCancel();
          }}
          description={
            dependentFill.isActive
              ? `${t('toAttachFileLaterDescription')} ${
                  docType.dependents[dependentFill.step].name
                }?`
              : t('toCancelDocCreationDescription')
          }
          onSubmit={() => {
            onConfirm();
            if (backModalOpen) confirmBack();
          }}
        />
      </Modal>
    );
  }
);
