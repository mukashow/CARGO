import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import {
  ActAcceptanceEdit,
  BrokerMain,
  Cash,
  CashReceiptOrderCreate,
  CashReceiptOrderDetail,
  ChiefManagerMain,
  ClientDetail,
  Clients,
  ContainerDetail,
  Handbooks,
  IconPage,
  LoadingListCreate,
  LoadingListDetail,
  LoadingListEdit,
  ManagerActAcceptanceCreate,
  ManagerActAcceptanceDetail,
  ManagerMain,
  PaymentInvoiceCreate,
  PaymentInvoiceDetail,
  PersonnelDetail,
  StorekeeperActAcceptanceCreate,
  StorekeeperActAcceptanceDetail,
  StorekeeperMain,
  Warehouse,
} from '@/pages';

const ChiefManager = () => {
  return (
    <Routes>
      <Route path="/" element={<ChiefManagerMain />} />

      <Route path="/handbooks/*" element={<Handbooks />} />

      <Route path="/clients">
        <Route path="" element={<Clients />} />
        <Route path=":clientId" element={<ClientDetail />} />
      </Route>

      <Route path="/goods_act_acceptance">
        <Route path=":actId" element={<ManagerActAcceptanceDetail />} />
        <Route path=":actId/edit" element={<ActAcceptanceEdit />} />
      </Route>

      <Route path="/warehouse" element={<Warehouse />}>
        <Route path=":warehouseId" element={<Warehouse />} />
      </Route>

      <Route path="/loading_list">
        <Route path="create" element={<LoadingListCreate />} />
        <Route path=":loadingListId" element={<LoadingListDetail />} />
        <Route path=":loadingListId/edit" element={<LoadingListEdit />} />
      </Route>

      <Route path="/container">
        <Route path=":containerId" element={<ContainerDetail />} />
      </Route>

      <Route path="/personnel">
        <Route path=":personnelId" element={<PersonnelDetail />} />
      </Route>

      <Route path="/payment_invoice/:id" element={<PaymentInvoiceDetail />} />

      <Route path="/cash_receipt_order/:id" element={<CashReceiptOrderDetail />} />

      <Route path="/cash" element={<Cash />} />

      {import.meta.env.MODE === 'development' && <Route path="/icon" element={<IconPage />} />}
    </Routes>
  );
};

const Manager = () => {
  const hasCashierPermission = useSelector(state => state.auth.user?.has_cashier_permissions);

  return (
    <Routes>
      <Route path="/" element={<ManagerMain />} />

      <Route path="/goods_act_acceptance">
        <Route path="create" element={<ManagerActAcceptanceCreate />} />
        <Route path=":actId" element={<ManagerActAcceptanceDetail />} />
        <Route path=":actId/edit" element={<ActAcceptanceEdit />} />
      </Route>

      <Route path="/warehouse" element={<Warehouse />} />

      <Route path="/loading_list">
        <Route path="create" element={<LoadingListCreate />} />
        <Route path=":loadingListId" element={<LoadingListDetail />} />
        <Route path=":loadingListId/edit" element={<LoadingListEdit />} />
      </Route>

      <Route path="/container">
        <Route path=":containerId" element={<ContainerDetail />} />
      </Route>

      <Route path="/loading_tasks" element={<ManagerMain />} />

      <Route path="/personnel">
        <Route path=":personnelId" element={<PersonnelDetail />} />
      </Route>

      <Route path="/cash" element={<Cash />} />
      <Route path="/payment_invoice/create" element={<PaymentInvoiceCreate />} />
      <Route path="/payment_invoice/:id" element={<PaymentInvoiceDetail />} />

      {import.meta.env.MODE === 'development' && <Route path="/icon" element={<IconPage />} />}
    </Routes>
  );
};

const StoreKeeper = () => {
  return (
    <Routes>
      <Route path="/" element={<StorekeeperMain />} />
      <Route path="/pending_acts" element={<StorekeeperMain />} />
      <Route path="/accepted_acts" element={<StorekeeperMain />} />
      <Route path="/loading_tasks" element={<StorekeeperMain />} />

      <Route path="/goods_act_acceptance">
        <Route path="create" element={<StorekeeperActAcceptanceCreate />} />
        <Route path=":actId" element={<StorekeeperActAcceptanceDetail />} />
      </Route>

      <Route path="/loading_list/:loadingListId" element={<LoadingListDetail />} />

      {import.meta.env.MODE === 'development' && <Route path="/icon" element={<IconPage />} />}
    </Routes>
  );
};

const Broker = () => {
  return (
    <Routes>
      <Route path="/" element={<BrokerMain />} />
      <Route path="/shipments_pending_confirmation" element={<BrokerMain />} />
      <Route path="/goods_act_acceptance/:actId" element={<ManagerActAcceptanceDetail />} />
      <Route path="/shipments_awaiting_clearance" element={<BrokerMain />} />
      <Route path="/loading_list/:loadingListId" element={<LoadingListDetail />} />

      {import.meta.env.MODE === 'development' && <Route path="/icon" element={<IconPage />} />}
    </Routes>
  );
};

const Cashier = () => {
  return (
    <Routes>
      <Route path="/cash" element={<Cash />} />

      <Route path="/payment_invoice">
        <Route path="create" element={<PaymentInvoiceCreate />} />
        <Route path=":id" element={<PaymentInvoiceDetail />} />
      </Route>

      <Route path="cash_receipt_order">
        <Route path=":id" element={<CashReceiptOrderDetail />} />
        <Route path="create" element={<CashReceiptOrderCreate />} />
      </Route>

      {import.meta.env.MODE === 'development' && <Route path="/icon" element={<IconPage />} />}
    </Routes>
  );
};

export const routes = {
  1: Manager,
  2: StoreKeeper,
  3: Cashier,
  4: Broker,
  5: ChiefManager,
};
