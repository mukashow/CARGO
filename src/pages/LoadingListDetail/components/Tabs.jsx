import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { declOfNum, uppercase } from '@/helpers';
import { fetchDocumentDocTypes, setExpenseInjectMode } from '@/store/actions';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Tabs as AppTabs, DocumentsTable, ExpensesTable } from '@/components';
import { GoodsTable, ModalDecipheringPlace, PlaceAddOrUnload } from './index';

const docSynopsis = ['документ', 'документа', 'документов'];

export const Tabs = ErrorBoundaryHoc(
  ({
    expenseInjectingMode,
    setAddGoodsModal,
    setCreateDocumentModal,
    setCancelConfirmModal,
    tabConfirmFn,
    fetchPlaces,
  }) => {
    const { loadingList, documents } = useSelector(state => ({
      loadingList: state.loadingList.loadingListDetail,
      documents: state.clients.documents,
    }));
    const expenses = useSelector(state => state.documents.expenses);
    const { roleId, hasStorekeeperPermission } = useSelector(state => ({
      roleId: state.auth.user.role_id,
      hasStorekeeperPermission: state.auth.user.has_storekeeper_permissions,
    }));
    const [activeTab, setActiveTab] = useState('goods');
    const [decodingCargoOpen, setDecodingCargoOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const { loadingListId } = useParams();
    const dispatch = useDispatch();

    const goodsTags = useMemo(() => {
      if (!loadingList) return [];
      const { place_count, receiver_count, volume, weight, cargo_density } = loadingList.total;
      const data = [
        `${receiver_count} ${uppercase(t('clients'))}`,
        `${place_count} ${t(place_count === 1 ? 'seat' : 'seats')}`,
        `${weight || 0} ${t('weightKg')}`,
        `${volume || 0} ${t('cubicMeter')}`,
        { title: `${cargo_density || 0}`, icon: 'density', tooltip: 'totalDensityFormula' },
      ];
      if (roleId !== 1 && roleId !== 5) {
        return data.filter(th => th.icon !== 'density');
      }
      return data;
    }, [loadingList]);

    const tabs = useMemo(() => {
      const data = [
        {
          title: 'goods',
          tags: goodsTags,
          onButtonClick:
            (roleId === 1 || roleId === 5) && loadingList?.can_change_goods_acceptance
              ? () => setAddGoodsModal(true)
              : null,
          buttonTitle: t('addCargo'),
        },
      ];

      if (String(roleId).match(/1|3|4|5/)) {
        const docCount = documents?.document_list_count || 0;
        const docCountSynopsis = declOfNum(docCount, docSynopsis);
        data.push(
          {
            title: 'expenses',
            tags: expenses ? [`${expenses.total_cost} $`] : [],
            onButtonClick: !!expenseInjectingMode
              ? null
              : () => dispatch(setExpenseInjectMode({ type: 'create' })),
            buttonTitle: t('addExpense'),
          },
          {
            title: 'tableDoc',
            tags: [
              docCount +
                ' ' +
                (i18n.language.match(/ru|ru-RU/)
                  ? docCountSynopsis
                  : t(docCount === 1 ? 'document' : 'documents')),
            ],
            onButtonClick: () => {
              setCreateDocumentModal(true);
              dispatch(fetchDocumentDocTypes(loadingListId));
            },
            buttonTitle: 'addDocument',
          }
        );
      }
      return data;
    }, [goodsTags, expenses, documents, expenseInjectingMode]);

    return (
      <>
        <AppTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onTabClick={
            !!expenseInjectingMode
              ? fn => {
                  setCancelConfirmModal(true);
                  tabConfirmFn.current = fn;
                }
              : null
          }
        />
        {activeTab === 'expenses' && (
          <ExpensesTable
            expenseInjectingMode={expenseInjectingMode}
            setCancelConfirmModal={setCancelConfirmModal}
            tabConfirmFn={tabConfirmFn}
          />
        )}
        {activeTab === 'goods' && (
          <>
            {(loadingList?.status === 7 ||
              (loadingList?.status === 12 && loadingList?.can_unload_places)) &&
              (roleId === 2 || hasStorekeeperPermission) && (
                <PlaceAddOrUnload
                  status={loadingList?.status}
                  setDecodingCargoOpen={setDecodingCargoOpen}
                />
              )}
            <GoodsTable
              fetchPlaces={fetchPlaces}
              goods={loadingList?.goods_list}
              status={loadingList?.status}
              setDecodingCargoOpen={setDecodingCargoOpen}
            />
          </>
        )}
        {activeTab === 'tableDoc' && <DocumentsTable clientId={loadingListId} type="document" />}
        <ModalDecipheringPlace
          isOpen={decodingCargoOpen}
          close={() => setDecodingCargoOpen(false)}
          roleId={roleId}
          hasStorekeeperPermission={hasStorekeeperPermission}
          fetchPlaces={fetchPlaces}
        />
      </>
    );
  }
);
