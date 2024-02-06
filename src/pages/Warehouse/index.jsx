import s from './index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  resetWarehouseOrder,
  setDimensions,
  setDimensionsInit,
  setHiddenWarehouses,
  setInitHiddenWarehouses,
  setInitVisibleWarehouses,
  setVisibleWarehouses,
} from '@slices/warehouse';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { ActAcceptanceList, Header, Icon, LoadingList, TableTabs } from '@/components';
import { Containers } from './Containers';
import { Personnel } from './Personnel';

const TABS = [
  { title: 'goods', params: { tab: 'goods' } },
  { title: 'containers', params: { tab: 'containers', page: 1, page_size: 25 } },
  {
    title: 'goodsAcceptanceActs',
    params: { tab: 'acceptance_certificate', page: 1, page_size: 50 },
  },
  { title: 'loadingLists', params: { tab: 'loading_lists', page: 1, page_size: 50 } },
  { title: 'personnel', params: { tab: 'personnel', page: 1, page_size: 25 } },
  { title: 'requests', params: { tab: 'requests' } },
];

export const Warehouse = ErrorBoundaryHoc(() => {
  const {
    warehouseList,
    hiddenWarehouses,
    visibleWarehouses,
    visibleWarehousesInit,
    hiddenWarehousesInit,
    dimensions,
    dimensionsInit,
  } = useSelector(state => ({
    warehouseList: state.warehouse.warehouseList,
    visibleWarehouses: state.warehouse.visibleWarehouses.actual,
    visibleWarehousesInit: state.warehouse.visibleWarehouses.init,
    hiddenWarehouses: state.warehouse.hiddenWarehouses.actual,
    hiddenWarehousesInit: state.warehouse.hiddenWarehouses.init,
    dimensions: state.warehouse.dimensions.actual,
    dimensionsInit: state.warehouse.dimensions.init,
  }));
  const roleId = useSelector(state => state.auth.user.role_id);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ref, setRef] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const pageSize = useMemo(() => {
    return TABS.find(({ params }) => params.tab === searchParams.get('tab'))?.params.page_size;
  }, [searchParams]);

  const preWarehouseList = useMemo(() => {
    if (!warehouseList) return;
    if (!dimensionsInit) return warehouseList;
    const preDimensions = [...dimensionsInit].sort((a, b) => a.id - b.id);
    const preWarehouses = [...warehouseList].sort((a, b) => a.id - b.id);
    if (preDimensions.length !== preWarehouses.length) {
      setHasChanges(true);
      return warehouseList;
    }
    let hasChanges = false;
    preDimensions.forEach(({ name }, index) => {
      if (name !== preWarehouses[index].name) hasChanges = true;
    });
    if (hasChanges) {
      setHasChanges(true);
      return warehouseList;
    }
    return visibleWarehouses;
  }, [warehouseList, dimensionsInit, visibleWarehouses]);

  const onHiddenWarehouseClick = (id, index) => {
    const visibleWarehouseList = [...visibleWarehousesInit];
    const hiddenWarehouseList = [...hiddenWarehousesInit];
    let dimensionsWarehouses = [...dimensionsInit];
    if (index !== undefined) {
      visibleWarehouseList.unshift(...hiddenWarehouseList.splice(index, 1));
      hiddenWarehouseList.unshift(visibleWarehouseList.pop());
      const movedEl = dimensionsWarehouses.find(item => item.id === id);
      dimensionsWarehouses = [movedEl, ...dimensionsWarehouses.filter(item => item.id !== id)];
    }
    navigate(`/warehouse/${id}?tab=${searchParams.get('tab')}&page=1&page_size=${pageSize}`);
    dispatch(setVisibleWarehouses(visibleWarehouseList));
    dispatch(setHiddenWarehouses(hiddenWarehouseList));
    dispatch(setDimensions(dimensionsWarehouses));
  };

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams(params => ({ ...params, tab: 'goods' }));
    }
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem('visibleWarehouses', JSON.stringify(visibleWarehouses));
    localStorage.setItem('hiddenWarehouses', JSON.stringify(hiddenWarehouses));
  }, [visibleWarehouses, hiddenWarehouses]);

  useEffect(() => {
    const setWarehouseList = target => {
      if (!target) return;
      const visibleWarehouses = [];
      const hiddenWarehouses = [];
      const items = [...target.children]
        .filter(item => !!item.dataset.name)
        .map(item => ({
          id: +item.dataset.id,
          name: item.dataset.name,
          width: item.offsetWidth + parseFloat(window.getComputedStyle(item).marginLeft) * 2,
        }));

      const warehouses = hasChanges ? items : dimensions || items;
      warehouses.forEach(({ id, name }, index, arr) => {
        const itemsWidth = arr.slice(0, index + 1).reduce((acc, next) => acc + next.width, 0);
        const itemsTotalWidth = itemsWidth + target.firstChild.offsetWidth + 80;

        if (itemsTotalWidth > target.offsetWidth) {
          return hiddenWarehouses.push({ id, name, initIndex: hiddenWarehouses.length });
        }
        return visibleWarehouses.push({ id, name });
      });
      dispatch(setVisibleWarehouses(visibleWarehouses));
      dispatch(setInitVisibleWarehouses(visibleWarehouses));
      dispatch(setInitHiddenWarehouses(hiddenWarehouses));
      dispatch(setHiddenWarehouses(hiddenWarehouses));

      if (!dimensions || hasChanges) dispatch(setDimensions(items));
      if (!dimensionsInit || hasChanges) dispatch(setDimensionsInit(items));
    };
    setWarehouseList(ref);
  }, [ref, hasChanges]);

  return (
    <>
      <Header mb={24} className={s.header}>
        {roleId === 5 && preWarehouseList && (
          <>
            <div className={s.warehouses} ref={setRef}>
              <div
                className={clsx(!warehouseId && s.active, s.warehouse)}
                onClick={() => {
                  navigate(
                    `/warehouse?tab=${searchParams.get('tab')}&page=1&page_size=${pageSize}`
                  );
                  dispatch(resetWarehouseOrder());
                }}
              >
                {t('allWarehouses')}
              </div>
              {preWarehouseList.map(({ id, name }) => (
                <div
                  data-name={name}
                  data-id={id}
                  className={clsx(+warehouseId === id && s.active, s.warehouse)}
                  key={id}
                  onClick={() => {
                    navigate(
                      `/warehouse/${id}?tab=${searchParams.get('tab')}&page=1&page_size=${pageSize}`
                    );
                    dispatch(resetWarehouseOrder());
                  }}
                >
                  {name}
                </div>
              ))}
              {!!hiddenWarehouses?.length && (
                <Icon iconId="arrowRight" color="white" iconClass={s.dropdownIcon} />
              )}
            </div>
            {!!hiddenWarehouses?.length && (
              <div className={clsx(s.warehouses, s.dropdown)}>
                {hiddenWarehouses.map(({ id, name, initIndex }) => (
                  <div
                    key={id}
                    className={clsx(+warehouseId === id && s.active, s.warehouse)}
                    onClick={() => onHiddenWarehouseClick(id, initIndex)}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Header>
      <TableTabs tabs={TABS} />
      {searchParams.get('tab') === 'containers' && <Containers />}
      {searchParams.get('tab') === 'acceptance_certificate' && <ActAcceptanceList />}
      {searchParams.get('tab') === 'loading_lists' && <LoadingList />}
      {searchParams.get('tab') === 'personnel' && <Personnel />}
    </>
  );
});
