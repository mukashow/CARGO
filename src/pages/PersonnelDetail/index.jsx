import React, { useEffect, useMemo, useRef, useState } from 'react';
import s from './index.module.scss';
import cardStyle from '@components/Card/FormCard/index.module.scss';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ActionInDetail,
  Box,
  CardInformation,
  FormCard,
  Header,
  ModalAction,
  ModalEditEmployee,
  ModalCreateDocument,
  DocumentsTable,
  Tabs,
  Loader,
} from '@/components';
import { AddPhone, Phone } from './components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  deletePersonnelPhone,
  fetchUserDocuments,
  fetchFilesType,
  fetchPersonnelDetail,
  fetchUsersDocumentsType,
} from '@/store/actions';

export const PersonnelDetail = ErrorBoundaryHoc(() => {
  const employee = useSelector(state => state.users.employee);
  const documents = useSelector(state => state.clients.documents);
  const [editEmployeeModal, setEditEmployeeModal] = useState(false);
  const [createDocumentModal, setCreateDocumentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [phoneMode, setPhoneMode] = useState(null);
  const { t } = useTranslation();
  const { personnelId } = useParams();
  const dispatch = useDispatch();
  const phoneId = useRef(null);

  const information = useMemo(() => {
    if (!employee) return [];
    const {
      name,
      last_name,
      otchestvo,
      role_name,
      home_address,
      warehouse_name,
      working_hours,
      username,
    } = employee;

    return [
      { title: `${t('clientFullName')}:`, value: `${last_name} ${name} ${otchestvo || ''}` },
      { title: `${t('humanPosition')}:`, value: role_name },
      { title: `${t('clientAddress')}:`, value: home_address },
      { title: `${t('warehouse')}`, value: warehouse_name },
      { title: `${t('shift')}:`, value: working_hours },
      { title: `${t('clientLogin')}:`, value: username },
    ];
  }, [employee]);

  const onPhoneDelete = () => {
    setConfirmLoading(true);
    dispatch(deletePersonnelPhone({ id: employee.id, phoneId: phoneId.current }))
      .then(() => setPhoneMode(null))
      .finally(() => setConfirmLoading(false));
  };

  useEffect(() => {
    dispatch(fetchFilesType(personnelId));

    setLoading(true);
    Promise.all([
      dispatch(fetchPersonnelDetail(personnelId)),
      dispatch(fetchUserDocuments(personnelId)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <Box style={{ padding: 24 }}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className={s.top}>
              <FormCard cardTitle={t('employee')} cardStyle={{ maxWidth: 410 }}>
                <div className={cardStyle.informationRoot}>
                  <CardInformation information={information.slice(0, 2)} />
                  {employee?.phones.map(({ id, ...item }, _, arr) => (
                    <Phone
                      key={id}
                      {...item}
                      workerId={employee?.id}
                      id={id}
                      phoneId={phoneId}
                      setPhoneMode={setPhoneMode}
                      showDeleteIcon={arr.length > 1}
                    />
                  ))}
                  <AddPhone setPhoneMode={setPhoneMode} phoneMode={phoneMode} />
                  <CardInformation information={information.slice(2, information.length)} />
                </div>
              </FormCard>
              <ActionInDetail
                onEdit={() => {
                  setEditEmployeeModal(true);
                  dispatch(fetchPersonnelDetail(personnelId));
                }}
              />
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
                    dispatch(fetchUsersDocumentsType(personnelId));
                  },
                  buttonTitle: 'addDocument',
                },
              ]}
              activeTab="tableDoc"
              setActiveTab={() => {}}
            />
            <DocumentsTable clientId={personnelId} type="user" />
          </>
        )}
        <ModalCreateDocument
          type="user"
          clientId={personnelId}
          isOpen={createDocumentModal}
          close={() => setCreateDocumentModal(false)}
        />
        <ModalEditEmployee
          initData={employee}
          isOpen={editEmployeeModal}
          close={() => setEditEmployeeModal(false)}
        />
        <ModalAction
          isOpen={phoneMode === 'delete'}
          submitButtonDisabled={confirmLoading}
          onCancel={() => setPhoneMode(null)}
          title={t('toDeletePhoneNumber')}
          description={t('toDeletePhoneNumberDescription')}
          onSubmit={onPhoneDelete}
        />
      </Box>
    </>
  );
});
