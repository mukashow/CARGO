import { configureStore } from '@reduxjs/toolkit';
import auth from '@slices/auth';
import bill from '@slices/bill';
import clients from '@slices/clients';
import container from '@slices/container';
import country from '@slices/country';
import currency from '@slices/currency';
import documents from '@slices/documents';
import goods from '@slices/goods';
import loadingList from '@slices/loadingList';
import phone from '@slices/phone';
import point from '@slices/point';
import routing from '@slices/routing';
import tariff from '@slices/tariff';
import transportation from '@slices/transportation';
import users from '@slices/users';
import warehouse from '@slices/warehouse';

export const store = configureStore({
  reducer: {
    auth,
    clients,
    country,
    phone,
    transportation,
    currency,
    warehouse,
    goods,
    routing,
    documents,
    loadingList,
    users,
    point,
    tariff,
    container,
    bill,
  },
  devTools: true,
});
