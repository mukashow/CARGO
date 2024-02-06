export const NAVIGATION_BY_ROLES = [
  {
    id: 1,
    title: 'Менеджер склада',
    navigation: [
      {
        path: '/',
        params: '?tab=expired&page=1&page_size=50&is_expired=true',
        title: 'mainPage',
        iconId: 'home',
      },
      { path: '/warehouse', title: 'warehousePage', iconId: 'sklads', params: '?tab=goods' },
      {
        path: '/loading_tasks',
        iconId: 'send',
        title: 'loadingTasks',
        params: '?tab=loading_tasks&page=1&page_size=25',
      },
      {
        path: '/cash',
        title: 'cash',
        iconId: 'wallet',
        dropdown: {
          title: 'createInCash',
          list: [{ title: 'paymentInvoice', path: '/payment_invoice/create' }],
        },
      },
    ],
  },
  {
    id: 2,
    title: 'Складовщик',
    navigation: [
      {
        path: '/',
        params: '?tab=pending&page=1&page_size=50',
        title: 'mainPage',
        iconId: 'home',
      },
      {
        path: '/pending_acts/',
        params: '?tab=pending&page=1&page_size=50',
        iconId: 'bell-alerts',
        title: 'inventoryPendingActs',
      },
      {
        path: '/accepted_acts',
        params: '?tab=accepted&page=1&page_size=50',
        iconId: 'box',
        title: 'acceptedActs',
      },
      {
        path: '/loading_tasks',
        iconId: 'send',
        title: 'loadingTasks',
        params: '?tab=loading_tasks&page=1&page_size=25',
      },
      { path: '/delivery_issuance', iconId: 'open-box', title: 'cargoDeliveryTasks' },
    ],
  },
  {
    id: 3,
    title: 'Кассир',
    navigation: [
      {
        path: '/',
        title: 'mainPage',
        iconId: 'home',
      },
      {
        path: '/cash',
        title: 'cash',
        iconId: 'wallet',
        dropdown: {
          title: 'createInCash',
          list: [
            { title: 'paymentInvoice', path: '/payment_invoice/create' },
            { title: 'cashReceiptOrder', path: '/cash_receipt_order/create' },
          ],
        },
      },
    ],
  },
  {
    id: 4,
    title: 'Брокер',
    navigation: [
      {
        path: '/',
        title: 'mainPage',
        iconId: 'home',
        params: '?tab=pending_confirmation&page=1&page_size=50',
      },
      {
        path: '/shipments_pending_confirmation',
        title: 'pendingConfirmationSends',
        iconId: 'send',
        params: '?tab=pending_confirmation&page=1&page_size=50',
      },
      {
        path: '/shipments_awaiting_clearance',
        title: 'sendsWaitingCustomsClearance',
        iconId: 'bell-alerts',
        params: '?tab=awaiting_clearance&page=1&page_size=50',
      },
    ],
  },
  {
    id: 5,
    title: 'Главный менеджер',
    navigation: [
      {
        path: '/',
        title: 'mainPage',
        iconId: 'home',
        params: '?tab=expired&page=1&page_size=50&is_expired=true',
      },
      {
        path: '/warehouse',
        title: 'warehouses',
        iconId: 'sklads',
        params: '?tab=goods',
      },
      { path: '/sending', title: 'sends', iconId: 'send' },
      { path: '/cash', title: 'cash', iconId: 'wallet' },
      { path: '/mutual_settlements', title: 'mutualSettlements', iconId: 'file' },
      {
        path: '/clients',
        params: '?tab=clients&page=1&page_size=40',
        title: 'clients',
        iconId: 'users',
      },
    ],
  },
  { id: 6, title: 'clients' },
];
