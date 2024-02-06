import mainStyle from '../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchTransportationTariffs } from '@/store/actions';
import { ErrorBoundaryHoc, Icon, Loader, Table } from '@/components';
import { Row as RowItem } from './DropdownTableRow';

const HEAD_ROW = ['kgInCubicMeter', 'calculationPerKgCubicMeter', 'cost', 'tableDocAction'];

const DropdownTable = ErrorBoundaryHoc(
  ({
    id,
    name,
    setModalDeleteTariffId,
    setIsCreatingTariff,
    tariffs,
    setConfirmCancel,
    directionId,
  }) => {
    const [createMode, setCreateMode] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
      setIsCreatingTariff(createMode);
    }, [createMode]);

    return (
      <Table
        className={mainStyle.dropdownTable}
        thead={
          <div className={mainStyle.dropdownTableHead}>
            <p>
              {t('clientContractType')}: <span>{name}</span>
            </p>
            <Icon
              iconId="plusCircle"
              color="#009E61"
              onClick={() => setCreateMode(true)}
              clickable
            />
          </div>
        }
        size="small"
        withBorder
        row={createMode ? [...tariffs, { createMode: true }] : tariffs}
        rowProps={{
          setModalDeleteTariffId,
          setConfirmCancel,
          contract_type: id,
          directionId,
          setCreateMode,
        }}
        headRow={HEAD_ROW}
        emptyMessage="tariffIsNotSet"
        RowComponent={RowItem}
        tableStyle={{ minWidth: 'auto' }}
      />
    );
  }
);

export const Row = ErrorBoundaryHoc(
  ({
    setModalDeleteTariffId,
    setIsCreatingTariff,
    setConfirmCancel,
    item: { id, tariffs: transportationTariffs, point_from, point_to, custom_clearance_country },
  }) => {
    const contractType = useSelector(state => state.documents.contractType);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const tariffs = useMemo(() => {
      if (!transportationTariffs || !contractType) return null;
      if (!transportationTariffs.contract_type_list) {
        return contractType.map(item => ({ ...item, tariffs: [] }));
      }

      const placeholder = contractType.filter(
        ({ id }) =>
          !transportationTariffs.contract_type_list.find(contract_type => contract_type.id === id)
      );
      return [
        ...transportationTariffs.contract_type_list,
        ...placeholder.map(item => ({ ...item, tariffs: [] })),
      ].sort((a, b) => a.id - b.id);
    }, [transportationTariffs, contractType]);

    const onDropDownClick = () => {
      setLoading(true);
      setDropdownOpen(!dropdownOpen);
      if (!dropdownOpen) {
        dispatch(
          fetchTransportationTariffs(
            `transportation_type_id=${searchParams.get(
              'transportation_type_id'
            )}&direction_id=${id}`
          )
        ).finally(() => setLoading(false));
      } else {
        setIsCreatingTariff(false);
      }
    };

    return (
      <>
        <tr
          onClick={onDropDownClick}
          className={s.clickable}
          {...(dropdownOpen && { style: { borderColor: 'transparent' } })}
        >
          <td className={s.text}>
            {point_from.name} - {custom_clearance_country && `${custom_clearance_country.name} - `}
            {point_to.name}
          </td>
          <td>
            <div className={s.actionWrap}>
              <Icon
                iconId={'arrowRight'}
                color="#0B6BE6"
                style={{ transform: `rotate(${dropdownOpen ? 90 : 0}deg)`, marginLeft: 'auto' }}
              />
            </div>
          </td>
        </tr>
        {dropdownOpen && (
          <tr>
            <td colSpan={2} style={{ padding: 0 }}>
              {loading ? (
                <Loader size="small" />
              ) : (
                <div className={mainStyle.dropdownTables}>
                  {tariffs?.map((props, index) => (
                    <DropdownTable
                      setConfirmCancel={setConfirmCancel}
                      key={props.id || index}
                      {...props}
                      setModalDeleteTariffId={setModalDeleteTariffId}
                      setIsCreatingTariff={setIsCreatingTariff}
                      directionId={id}
                    />
                  ))}
                </div>
              )}
            </td>
          </tr>
        )}
      </>
    );
  }
);
