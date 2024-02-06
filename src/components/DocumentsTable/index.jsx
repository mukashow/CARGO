import mainStyle from './index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { usePopper } from 'react-popper';
import { useDispatch, useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  ErrorBoundaryHoc,
  Icon,
  ModalAction,
  ModalCreateDocument,
  ModalEditDocument,
  Table,
} from '@/components';
import {
  deleteDocument,
  fetchAllContainerDocumentTypes,
  fetchDocumentDocTypes,
  fetchUsersDocumentsType,
} from '@actions';
import { useOutsideClick } from '@/hooks';

const HEAD_ROW = [
  'tableDocType',
  'tableDocDate',
  'tableDocCreate',
  'tableDocComment',
  'tableDocFiles',
  'tableDocAction',
];

export const DocumentsTable = ErrorBoundaryHoc(({ clientId, type }) => {
  const documents = useSelector(state => state.clients.documents);
  const [loading, setLoading] = useState(false);

  const [doc, setDoc] = useState({
    id: '',
    title: '',
    doc_type: {
      label: '',
      value: '',
    },
    comment: '',
    files: [],
    editModalOpen: false,
    removeModalOpen: false,
    createModalOpen: false,
  });
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onDelete = async () => {
    setLoading(true);
    await dispatch(deleteDocument({ id: doc.id, clientId, type })).finally(() => setLoading(false));
    setDoc({
      id: '',
      title: '',
      doc_type: {
        label: '',
        value: '',
      },
      comment: '',
      files: [],
      editModalOpen: false,
      removeModalOpen: false,
      createModalOpen: false,
    });
  };

  useEffect(() => {
    switch (type) {
      case 'document':
        dispatch(fetchDocumentDocTypes(clientId));
        break;
      case 'container':
        dispatch(fetchAllContainerDocumentTypes(clientId));
        break;
      default:
        dispatch(fetchUsersDocumentsType(clientId));
    }
  }, []);

  return (
    <>
      <Table
        headRow={HEAD_ROW}
        className={mainStyle.table}
        withBorder
        row={
          documents ? [...documents.required_document_type_list, ...documents.document_list] : null
        }
        RowComponent={DocumentsRow}
        rowProps={{ setDoc }}
      />
      <ModalEditDocument
        type={type}
        clientId={clientId}
        isOpen={doc.editModalOpen}
        close={() => setDoc({ ...doc, editModalOpen: false })}
        {...doc}
      />
      <ModalCreateDocument
        type={type}
        clientId={clientId}
        docToAttach={doc.doc_type}
        isOpen={doc.createModalOpen}
        close={() => setDoc({ ...doc, createModalOpen: false })}
      />
      <ModalAction
        isOpen={doc.removeModalOpen}
        onCancel={() => setDoc({ ...doc, removeModalOpen: false })}
        onSubmit={onDelete}
        submitButtonDisabled={loading}
        title={`${t('delete')} ${doc.title}?`}
        description={t('toDeleteDocTypeDescription')}
      />
    </>
  );
});

const DocumentsRow = ErrorBoundaryHoc(({ item, setDoc }) => {
  const [isShow, setIsShow] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const { t } = useTranslation();
  const actionRef = useRef(null);
  const [showToggle, setShowToggle] = useState(null);
  const [filesDropdownRef, setFilesRef] = useState(null);
  const [dropdownRef, setDropdownRef] = useState(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentDropdownRef, setCommentDropdownRef] = useState(null);
  const [commentWrapRef, setCommentWrapRef] = useState(null);
  const [commentWidth, setCommentWidth] = useState(200);
  useOutsideClick([filesDropdownRef, dropdownRef], () => setIsShow(false));
  useOutsideClick({ current: commentDropdownRef }, () => setCommentOpen(false));
  useOutsideClick(actionRef, () => setActionOpen(false));

  const { styles, attributes } = usePopper(filesDropdownRef, dropdownRef, {
    placement: 'right-start',
    modifiers: {
      name: 'offset',
      options: {
        offset: [10, filesDropdownRef ? filesDropdownRef.clientWidth : 0],
      },
    },
  });

  const commentPopper = usePopper(commentWrapRef, commentDropdownRef, {
    placement: 'right-start',
    modifiers: {
      name: 'offset',
      options: {
        offset: [
          0,
          commentWrapRef
            ? -Math.abs(commentWrapRef.clientWidth - (window.innerWidth > 1440 ? 30 : 12))
            : 0,
        ],
      },
    },
  });

  const onDelete = () => {
    setDoc(state => ({
      ...state,
      id: item.id,
      title: item.doc_type_name,
      removeModalOpen: true,
    }));
  };

  const onEdit = create => {
    setDoc(state => ({
      ...state,
      id: item.id,
      doc_type: {
        label: item.doc_type_name || item.name,
        value: item.doc_type_id || item.id,
      },
      comment: item.comment,
      files: item.files || [],
      editModalOpen: !create,
      createModalOpen: create,
    }));
  };

  useEffect(() => {
    if (commentWrapRef) {
      setCommentWidth(
        commentWrapRef.offsetParent.clientWidth -
          commentWrapRef.offsetLeft -
          (window.innerWidth > 1440 ? 30 : 12)
      );
    }
  }, [commentWrapRef]);

  return (
    <tr>
      <td>
        <div className={clsx(s.textFlex, s.text)}>
          {item.name ? (
            <div className={clsx(s.textFlex, s.text)}>
              <div className={s.alertIcon} data-tip data-for={String(item.id)}>
                <Icon iconId="alert" />
              </div>
              <ReactTooltip id={String(item.id)}>
                <span>{item.msg}</span>
              </ReactTooltip>
              {item.name}
            </div>
          ) : (
            <div className={clsx(s.textFlex, s.text)}>
              {!item.files?.length && (
                <div>
                  <div className={s.alertIcon} data-tip data-for={String(item.id)}>
                    <Icon iconId="alert" />
                  </div>
                  <ReactTooltip id={String(item.id)}>
                    <span>{item.msg}</span>
                  </ReactTooltip>
                </div>
              )}
              {item.doc_type_name}
            </div>
          )}
        </div>
      </td>
      <td>
        {item.created_at && (
          <span className={s.text}>
            {dayjs(item.created_at, 'DD.MM.YYYY').format('DD.MM.YYYY')}
          </span>
        )}
      </td>
      <td>
        <div className={s.text}>{item?.created_by_name}</div>
      </td>
      <td style={{ position: 'relative' }} ref={setCommentWrapRef}>
        <div
          className={clsx(s.text, mainStyle.comment)}
          ref={el => {
            if (el) {
              setShowToggle(el.scrollHeight > el.clientHeight);
            }
          }}
        >
          {item?.comment}
        </div>
        {showToggle && (
          <div className={mainStyle.commentToggle}>
            <p onClick={() => setCommentOpen(!commentOpen)}>{t('readMore')}</p>
          </div>
        )}
        {commentOpen &&
          createPortal(
            <div
              className={mainStyle.commentDropdown}
              ref={setCommentDropdownRef}
              style={{ ...commentPopper.styles.popper, maxWidth: commentWidth }}
              {...commentPopper.attributes}
            >
              {item?.comment}
            </div>,
            document.body
          )}
      </td>
      <td>
        {item.files?.length === 1 && (
          <a target="_blank" href={item.files[0].file} rel="noopener noreferrer" className={s.text}>
            <Icon
              iconClass={s.fileIcon}
              iconId={
                item.files[0].filetype === 'pdf'
                  ? 'pdf-indicator'
                  : item.files[0].filetype === 'word'
                  ? 'word-indicator'
                  : 'image-indicator'
              }
            />
          </a>
        )}
        {item.files?.length > 1 && (
          <div className={s.text} style={{ display: 'inline-block' }}>
            <Icon
              ref={setFilesRef}
              iconClass={s.fileIcon}
              iconId="file-2"
              iconHeight={19}
              iconWidth={19}
              clickable
              onClick={() => setIsShow(!isShow)}
            />
            ({item.files?.length})
            {isShow &&
              createPortal(
                <div
                  className={s.files}
                  ref={setDropdownRef}
                  style={styles.popper}
                  {...attributes.popper}
                >
                  {item.files.map(item => (
                    <a
                      key={item.id}
                      className={s.filesItem}
                      target="_blank"
                      href={item.file}
                      rel="noopener noreferrer"
                    >
                      <Icon
                        iconClass={s.fileIcon}
                        iconId={
                          item.filetype === 'pdf'
                            ? 'pdf-indicator'
                            : item.filetype === 'word'
                            ? 'word-indicator'
                            : 'image-indicator'
                        }
                        iconHeight={19}
                        iconWidth={19}
                      />
                      {item.name}
                    </a>
                  ))}
                </div>,
                document.body
              )}
          </div>
        )}
        {(!item.doc_type_id || !item.files.length) && (
          <div className={s.ziper} onClick={() => onEdit(!item.doc_type_id)}>
            <Icon iconClass={s.ziperIcon} iconId="zip-file" iconHeight={19} iconWidth={19} />
            {t('tableDocAdd')}
          </div>
        )}
      </td>
      <td style={{ position: 'relative' }}>
        {item.doc_type_id && (
          <div className={s.actionWrap}>
            <div ref={actionRef}>
              <Icon
                iconClass={s.actionIcon}
                iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                onClick={() => setActionOpen(!actionOpen)}
                clickable
              />
              {actionOpen && (
                <div
                  className={s.actionDropdown}
                  {...(item?.comment?.length > 300 && {
                    style: { transform: 'translateY(-50%)', top: '50%', bottom: 'unset' },
                  })}
                >
                  <div className={s.actionDropdownButton} onClick={() => onEdit(false)}>
                    <Icon iconId="edit" color="#0B6BE6" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div
                    className={s.actionDropdownButton}
                    style={{ marginRight: 4 }}
                    onClick={onDelete}
                  >
                    <Icon iconId="trash" color="#DF3B57" />
                    <span>{t('delete')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
});
