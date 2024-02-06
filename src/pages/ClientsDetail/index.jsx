import s from './index.module.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  DocumentsTable,
  Box,
  ModalEditClient,
  Icon,
  Tabs,
  ModalCreateDocument,
  Loader,
  Header,
} from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { DetailedClient } from './components';
import {
  fetchPhoneCode,
  fetchPhoneType,
  fetchUserDocuments,
  fetchClient,
  fetchUsersDocumentsType,
  fetchFilesType,
} from '@/store/actions';

export const ClientDetail = ErrorBoundaryHoc(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { clientId } = useParams();
  const { client, documents } = useSelector(state => ({
    client: state.clients.client,
    documents: state.clients.documents,
  }));
  const [loading, setLoading] = useState(false);
  const filesType = useSelector(state => state.documents.filesType);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createDocumentModal, setCreateDocumentModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPhoneType());
    dispatch(fetchPhoneCode());
    setLoading(true);
    Promise.all([dispatch(fetchClient(clientId)), dispatch(fetchUserDocuments(clientId))]).finally(
      () => setLoading(false)
    );
  }, []);

  useEffect(() => {
    if (!filesType) dispatch(fetchFilesType());
  }, [filesType]);

  const openModalEditClient = () => {
    dispatch(fetchPhoneCode());
    setEditModalOpen(true);
  };

  return (
    <>
      <Header />
      <Box style={{ padding: 24 }}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className={s.wrapper}>
              {client && <DetailedClient />}
              <div className={s.actionWrapper}>
                <div className={s.action}>
                  <div
                    className={`${s.actionButton} ${s.actionButtonBlue}`}
                    onClick={openModalEditClient}
                  >
                    <Icon iconId="edit" />
                  </div>
                </div>
              </div>
            </div>
            <Tabs
              tabs={[
                {
                  title: 'tableDoc',
                  tags: [
                    (documents?.document_list_count || 0) +
                      ' ' +
                      t(documents?.document_list_count === 1 ? 'document' : 'documents'),
                  ],
                  onButtonClick: () => {
                    setCreateDocumentModal(true);
                    dispatch(fetchUsersDocumentsType(clientId));
                  },
                  buttonTitle: 'addDocument',
                },
              ]}
              activeTab="tableDoc"
              setActiveTab={() => {}}
            />
            <DocumentsTable clientId={clientId} type="user" />
          </>
        )}
        <ModalEditClient isOpen={editModalOpen} close={() => setEditModalOpen(false)} />
        <ModalCreateDocument
          type="user"
          clientId={clientId}
          isOpen={createDocumentModal}
          close={() => setCreateDocumentModal(false)}
        />
      </Box>
    </>
  );
});
