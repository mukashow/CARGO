import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { declOfNum } from '@/helpers';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Tabs as AppTabs, DocumentsTable, ModalCreateDocument } from '@/components';
import { fetchAllContainerDocumentTypes } from '@actions';

export const Tabs = ErrorBoundaryHoc(() => {
  const documents = useSelector(state => state.clients.documents);
  const [activeTab, setActiveTab] = useState('tableDoc');
  const [createDocumentModal, setCreateDocumentModal] = useState(false);
  const { containerId } = useParams();
  const dispatch = useDispatch();

  const tabs = useMemo(() => {
    return [
      {
        title: 'tableDoc',
        tags: [
          `${documents?.document_list_count} ${declOfNum(documents?.document_list_count, [
            'документ',
            'документа',
            'документов',
          ])}`,
        ],
        onButtonClick: () => {
          setCreateDocumentModal(true);
          dispatch(fetchAllContainerDocumentTypes(containerId));
        },
        buttonTitle: 'addDocument',
      },
    ];
  }, [documents]);

  return (
    <>
      <AppTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'tableDoc' && <DocumentsTable clientId={containerId} type="container" />}
      <ModalCreateDocument
        type="container"
        clientId={containerId}
        isOpen={createDocumentModal}
        close={() => setCreateDocumentModal(false)}
      />
    </>
  );
});
