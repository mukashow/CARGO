export { NAVIGATION_BY_ROLES } from './navigation';
export const HANDBOOKS = [
  { label: 'countries', path: 'countries', params: { page: 1, page_size: 25 } },
  { label: 'phoneNumbersTypes', path: 'phone_numbers_types', params: { page: 1, page_size: 25 } },
  { label: 'attachedDocsTypes', path: 'attached_docs_types', params: { page: 1, page_size: 25 } },
  {
    label: 'attachedDocsByUsersTypes',
    path: 'attached_docs_types_by_role',
    params: { page: 1, page_size: 25 },
  },
  { label: 'warehouses', path: 'warehouses', params: { page: 1, page_size: 25 } },
  { label: 'containersStates', path: 'containers_states', params: { page: 1, page_size: 25 } },
  { label: 'currencyWord', path: 'currency', params: { page: 1, page_size: 25 } },
  { label: 'additionalCostsTypes', path: 'consumption_type', params: { page: 1, page_size: 25 } },
  { label: 'goodsTypes', path: 'goods_types', params: { page: 1, page_size: 25 } },
  {
    label: 'waypointsAndDirections',
    path: 'waypoints_and_directions',
    params: { page: 1, page_size: 25 },
  },
  { label: 'directions', path: 'directions', params: { page: 1, page_size: 25 } },
  { label: 'routes', path: 'routes', params: { page: 1, page_size: 25 } },
  {
    label: 'customsClearanceFees',
    path: 'custom_clearance_fees',
    params: { page: 1, page_size: 25 },
  },
  {
    label: 'transportationTariffs',
    path: 'transportation_tariffs',
    params: { page: 1, page_size: 25 },
  },
  { label: 'docProcessingFees', path: 'doc_processing_fees', params: { page: 1, page_size: 25 } },
  { label: 'exchangeRates', path: 'exchange_rates' },
];
