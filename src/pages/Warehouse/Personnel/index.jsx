import React, { useEffect, useMemo, useRef, useState } from 'react';
import s from '../index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Icon, ModalEditEmployee, SelectCustom, Table } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { useOutsideClick, useSearchParamsState } from '@/hooks';
import { fetchPersonnel, fetchPersonnelDetail } from '@/store/actions';

const HEAD_ROW = [
  'clientFullName',
  'humanPosition',
  'workShift',
  'clientLogin',
  'tableClientPhone',
  'warehousePage',
  'tableClientAddress',
  'tableClientAction',
];

export const Personnel = ErrorBoundaryHoc(() => {
  const roleId = useSelector(state => state.auth.user.role_id);
  const { employees, employee } = useSelector(state => ({
    employees: state.users.employees,
    employee: state.users.employee,
  }));
  const [modalEditEmployee, setModalEditEmployee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { warehouseId } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = `page=${searchParams.get('page')}&page_size=${searchParams.get(
      'page_size'
    )}&warehouse__in=${warehouseId}`;
    setLoading(true);
    dispatch(fetchPersonnel(warehouseId ? params : searchParams)).finally(() => setLoading(false));

    if (!searchParams.get('page') || !searchParams.get('page_size')) {
      setSearchParams({ page: 1, page_size: 25 });
    }
  }, [searchParams, warehouseId]);

  return (
    <Box>
      <Table
        loading={loading}
        row={employees?.results}
        rowProps={{ setModalEditEmployee }}
        resultsCount={employees?.page.results_count}
        currentPage={employees?.page.current_page}
        RowComponent={Row}
        headRow={HEAD_ROW}
        filter={roleId === 5 && !warehouseId && <Filter />}
        emptyMessage={t('listOfEmployeesEmpty')}
      />
      <ModalEditEmployee
        initData={employee}
        isOpen={modalEditEmployee}
        close={() => setModalEditEmployee(false)}
      />
    </Box>
  );
});

const Filter = ErrorBoundaryHoc(() => {
  const warehouseList = useSelector(state => state.warehouse.warehouseList);
  const [searchParams, setSearchParams] = useSearchParamsState();
  const { t } = useTranslation();

  const warehouseValues = useMemo(() => {
    return warehouseList
      ?.filter(({ id }) => searchParams.get('warehouse__in')?.split(',').includes(String(id)))
      .map(({ id, name }) => ({ label: name, value: id }));
  }, [warehouseList, searchParams]);

  return (
    <div className={s.filterWrap}>
      <SelectCustom
        floatLabel
        labelText={t('warehousePage')}
        isMulti
        value={warehouseValues}
        onChange={values => {
          setSearchParams({ warehouse__in: values.map(({ value }) => value).toString(), page: 1 });
        }}
        options={warehouseList?.map(item => ({
          label: item.name,
          value: item.id,
        }))}
        placeholder={null}
        style={{ margin: '0 16px 0 auto', maxWidth: 200 }}
        thin
      />
      <Icon
        iconId="cleaner"
        clickable
        color="#DF3B57"
        onClick={() => {
          setSearchParams({ tab: 'personnel', page: 1, page_size: 25 }, true);
        }}
      />
    </div>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: {
      id,
      last_name,
      name,
      otchestvo,
      role_name,
      working_hours,
      username,
      phones,
      warehouse_name,
      home_address,
      has_required_doc_types,
    },
    setModalEditEmployee,
  }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const { t } = useTranslation();
    const ref = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useOutsideClick(ref, () => setActionOpen(false));

    return (
      <tr onClick={() => navigate(`/personnel/${id}`)} className={tableStyle.clickable}>
        <td>
          <div className={tableStyle.textFlex}>
            {has_required_doc_types && (
              <Icon iconId="alert" color="#DF3B57" style={{ marginRight: 10 }} />
            )}
            <span className={tableStyle.text}>
              {last_name} {name} {otchestvo}
            </span>
          </div>
        </td>
        <td className={tableStyle.text}>{role_name}</td>
        <td className={tableStyle.text}>{working_hours}</td>
        <td className={tableStyle.text}>{username}</td>
        <td className={tableStyle.text}>
          {phones.map(({ number, country_code }) => country_code + number).join(', ')}
        </td>
        <td className={tableStyle.text}>{warehouse_name}</td>
        <td className={tableStyle.text}>{home_address}</td>
        <td style={{ position: 'relative' }}>
          <div className={tableStyle.actionWrap}>
            <div ref={ref}>
              <Icon
                iconClass={tableStyle.actionIcon}
                iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                onClick={e => {
                  setActionOpen(!actionOpen);
                  e.stopPropagation();
                }}
                clickable
              />
              <Icon iconId="arrowRight" color="#0B6BE6" />
              {actionOpen && (
                <div className={tableStyle.actionDropdown} onClick={e => e.stopPropagation()}>
                  <div
                    onClick={() => {
                      setModalEditEmployee(true);
                      dispatch(fetchPersonnelDetail(id));
                    }}
                    className={`${tableStyle.actionDropdownButton} ${tableStyle.actionDropdownButtonBlue}`}
                  >
                    <Icon iconId="edit" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }
);
