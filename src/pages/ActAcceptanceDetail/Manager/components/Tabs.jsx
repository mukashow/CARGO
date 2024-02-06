import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { declOfNum } from '@/helpers';
import {
  fetchDocumentDocTypes,
  fetchDocumentExpenses,
  setExpenseInjectMode,
} from '@/store/actions';
import { PlaceAddForm } from '@pages/ActAcceptanceDetail/Storekeeper/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  Tabs as AppTabs,
  DocumentsTable,
  ExpensesTable,
  ModalCreateDocument,
  ModalDecipheringPlaces,
} from '@/components';
import { fetchPlacesByTnved } from '@actions/goods';
import { GoodsTable } from './index';

const docSynopsis = ['документ', 'документа', 'документов'];

export const Tabs = ErrorBoundaryHoc(
  ({ isInventoryMode, setCancelConfirmModal, expenseInjectingMode, tabConfirmFn }) => {
    const { goodsDetail, documents, placesByTnved } = useSelector(state => ({
      goodsDetail: state.goods.goodsDetail,
      documents: state.clients.documents,
      placesByTnved: state.goods.placesByTnved,
    }));
    const expenses = useSelector(state => state.documents.expenses);
    const { hasStorekeeperPermissions, roleId } = useSelector(state => ({
      hasStorekeeperPermissions: state.auth.user.has_storekeeper_permissions,
      roleId: state.auth.user.role_id,
    }));
    const [activeTab, setActiveTab] = useState('goods');
    const [createDocumentModal, setCreateDocumentModal] = useState(false);
    const [placeModalOpen, setPlaceModalOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const { actId } = useParams();

    const goodsTags = useMemo(() => {
      if (!goodsDetail) return [];
      if (!goodsDetail.total_of_goods.length) return [];
      const { cost, place_count, volume, weight } = goodsDetail.total;

      const data = [
        `${place_count} ${place_count === 1 ? t('seat') : t('seats')}`,
        `${weight} ${t('weightKg')}`,
        `${volume} ${t('cubicMeter')}`,
      ];

      if (goodsDetail.currency) {
        return [...data, `${cost} ${goodsDetail.currency.symbol}`];
      }
      return data;
    }, [goodsDetail]);

    const tabs = useMemo(() => {
      const docCount = documents?.document_list_count || 0;
      const docCountSynopsis = declOfNum(docCount, docSynopsis);

      const tabArr = [{ title: 'goods', tags: goodsTags }];

      if (String(roleId).match(/1|3|5/)) {
        tabArr.push({
          title: 'expenses',
          onButtonClick:
            roleId === 1 || roleId === 5
              ? !!expenseInjectingMode
                ? null
                : () => dispatch(setExpenseInjectMode({ type: 'create' }))
              : null,
          buttonTitle: t('addExpense'),
          tags: [`${expenses?.total_cost} $`],
        });
      }

      tabArr.push({
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
          dispatch(fetchDocumentDocTypes(actId));
        },
        buttonTitle: 'addDocument',
      });

      return tabArr;
    }, [goodsTags, documents, expenses, expenseInjectingMode]);

    const onViewPlace = tnved => {
      dispatch(fetchPlacesByTnved({ id: actId, tnved }))
        .unwrap()
        .then(() => setPlaceModalOpen(true));
    };

    useEffect(() => {
      if (String(roleId).match(/1|3|5/)) {
        dispatch(fetchDocumentExpenses(actId));
      }
    }, []);

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
        {activeTab === 'goods' && hasStorekeeperPermissions && isInventoryMode ? (
          <div style={{ marginBottom: 24 }}>
            <PlaceAddForm onViewPlace={onViewPlace} />
          </div>
        ) : null}
        {activeTab === 'goods' && (
          <GoodsTable
            goods={goodsDetail?.total_of_goods}
            currencySymbol={goodsDetail?.currency?.symbol || ''}
            onViewPlace={onViewPlace}
          />
        )}
        {activeTab === 'expenses' && (
          <ExpensesTable
            setCancelConfirmModal={setCancelConfirmModal}
            expenseInjectingMode={expenseInjectingMode}
            tabConfirmFn={tabConfirmFn}
          />
        )}
        {activeTab === 'tableDoc' && <DocumentsTable clientId={actId} type="document" />}
        <ModalCreateDocument
          type="document"
          clientId={actId}
          isOpen={createDocumentModal}
          close={() => setCreateDocumentModal(false)}
        />
        <ModalDecipheringPlaces
          isOpen={placeModalOpen}
          close={() => setPlaceModalOpen(false)}
          placesByTnved={placesByTnved}
        />
      </>
    );
  }
);
