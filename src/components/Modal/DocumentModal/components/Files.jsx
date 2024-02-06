import React, { useState } from 'react';
import s from '../index.module.scss';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Input, ModalAction } from '@/components';
import { deleteFileFromDocument } from '@actions';

export const Files = ({
  files,
  status,
  setStatus,
  remove,
  docType,
  errors,
  append,
  trigger,
  docId,
  clientId,
  type,
}) => {
  const filesType = useSelector(state => state.documents.filesType);
  const [file, setFile] = useState({ id: null, index: null });
  const [deleting, setDeleting] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const onDropFile = e => {
    const exceededSizes = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files.item(i);
      if (
        +(e.target.files.item(i).size / 1024 / 1024).toFixed(1) >
        (docType.max_size || docType.doc_type_max_size)
      ) {
        exceededSizes.push(file.name);
      } else {
        append({ file });
      }
    }
    if (exceededSizes.length) {
      const ruWarn = `Невозможно прикрепить файлы ${exceededSizes.join(
        ', '
      )}, максимальный размер файла превышен`;
      const enWarn = `Unable to attach files ${exceededSizes.join(
        ', '
      )}, maximum file size exceeded`;
      const zhWarn = `无法附加文件 ${exceededSizes.join(', ')}, 超过了最大文件尺寸`;
      toast.warn(
        i18n.language.match(/ru|ru-RU/) ? ruWarn : i18n.language.match(/en-en-US/) ? enWarn : zhWarn
      );
    }
    trigger('files');
    e.target.value = '';
  };

  const onDeleteFile = () => {
    setDeleting(true);
    dispatch(deleteFileFromDocument({ docId, fileId: file.id, clientId, type }))
      .unwrap()
      .then(() => {
        remove(file.index);
        setStatus(status => status.filter((_, statusIndex) => statusIndex !== file.index));
        setFile({ id: null, index: null });
      })
      .finally(() => setDeleting(false));
  };

  return (
    <div className={s.fileLabel}>
      {t('document')}:
      <div className={s.fileFake}>
        {files.map(({ id, ...rest }, index) => (
          <File
            key={id}
            status={status[index]}
            setStatus={setStatus}
            index={index}
            remove={remove}
            trigger={trigger}
            setFile={setFile}
            {...rest}
          />
        ))}
        <label
          className={s.fileFakeIndicator}
          disabled={!docType || files.length >= (docType.max_count || docType.doc_type_max_count)}
        >
          <input
            type="file"
            hidden
            onChange={onDropFile}
            multiple
            accept={filesType?.map(file => `.${file}`).join(',')}
          />
          <Icon iconClass={s.icon} iconId="zip-file" />
          {t('attachFile')}
        </label>
      </div>
      {!!docType && <Input type="hidden" errors={errors.files?.message} />}
      <ModalAction
        isOpen={!!file.id}
        submitButtonDisabled={deleting}
        onSubmit={onDeleteFile}
        onCancel={() => setFile({ id: null, index: null })}
        title={t('toDeleteFile')}
        description={t('toDeleteFileDescription')}
      />
    </div>
  );
};

const File = ({ file, fileId, index, status, remove, setStatus, trigger, setFile }) => {
  const format = file.name.split('.').at(-1);

  return (
    <div className={s.fileTile} key={file.name}>
      <Icon
        iconId={
          format.match(/jpeg|jpg|png/)
            ? 'image-indicator'
            : format.match(/doc|docx/)
            ? 'word-indicator'
            : 'pdf-indicator'
        }
      />
      <span>{file.name}</span>
      {status === 'loading' && <div className={s.progress} />}
      {status === 'success' && !fileId && (
        <Icon iconId="access" iconWidth={18} iconHeight={18} color="#009e61" />
      )}
      {(status === 'error' || !status || (status === 'success' && fileId)) && (
        <Icon
          iconId={status === 'error' ? 'alert' : 'trash'}
          iconWidth={18}
          iconHeight={18}
          color="#DF3B57"
          clickable
          onClick={() => {
            if (fileId) return setFile({ id: fileId, index });
            remove(index);
            setStatus(status => status.filter((_, statusIndex) => statusIndex !== index));
            trigger('files');
          }}
        />
      )}
    </div>
  );
};
