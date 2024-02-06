import s from '../index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Checkbox, Icon, Table, TableChain } from '@/components';

const DROPDOWN_HEAD_ROW = [
  'goodsTypeFilter',
  'tnVedCode',
  'seatsNumber',
  'weight',
  'volume',
  'tariff',
  'sum',
];

export const Row = ErrorBoundaryHoc(
  ({
    item: {
      id,
      acceptance_date,
      receiver,
      contract_type,
      direction,
      place_count,
      weight,
      volume,
      cost,
      currency,
      tags,
      status,
      goods_list,
    },
    setCheckedActs,
    checkedActs,
  }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { t } = useTranslation();

    const onCheck = () => {
      setCheckedActs(
        checkedActs.includes(id) ? checkedActs.filter(actId => actId !== id) : [...checkedActs, id]
      );
    };

    return (
      <>
        <tr className={dropdownOpen ? s.opened : null}>
          <td>
            <Checkbox
              size="big"
              containerStyle={{ position: 'relative', zIndex: 2 }}
              checked={checkedActs.includes(id)}
              onChange={onCheck}
            />
            <span className={s.clicker} onClick={() => setDropdownOpen(!dropdownOpen)} />
          </td>
          <td>
            <span className={tableStyle.text}>{id}</span>
          </td>
          <td>
            <span className={tableStyle.text}>{acceptance_date?.slice(0, 10)}</span>
          </td>
          <td>
            <span className={tableStyle.text}>{receiver.code}</span>
          </td>
          <td>
            <span className={tableStyle.text}>{contract_type?.name}</span>
          </td>
          <td style={{ maxWidth: 400 }}>
            <TableChain
              chain={[
                { title: direction.point_from_name },
                { title: direction.custom_clearance_country_name },
                { title: direction.point_to_name },
              ]}
            />
          </td>
          <td>
            <span className={tableStyle.text}>{place_count}</span>
          </td>
          <td>
            <span className={tableStyle.text}>
              {weight} {t('weightKg')}
            </span>
          </td>
          <td>
            <span className={tableStyle.text}>
              {volume} {t('cubicMeter')}
            </span>
          </td>
          <td>
            <span className={tableStyle.text}>
              {cost} {currency?.symbol}
            </span>
          </td>
          <td>
            <span className={tableStyle.text}>{tags.map(({ name }) => name).join(', ')}</span>
          </td>
          <td>
            <div className={tableStyle.textFlex}>
              <div className={tableStyle.status}>
                <span
                  data-status={status.id}
                  data-status-type="goodsAcceptance"
                  {...(status.name.length > 15 && { style: { whiteSpace: 'break-spaces' } })}
                >
                  {status.name}
                </span>
              </div>
              <Icon
                iconId="arrowRight"
                color="#0B6BE6"
                style={{ transform: `rotate(${dropdownOpen ? 90 : 0}deg)`, marginLeft: 10 }}
              />
            </div>
          </td>
        </tr>
        {dropdownOpen && (
          <tr className={s.trDropdown}>
            <td colSpan={12}>
              <Table
                size="small"
                withBorder
                row={goods_list}
                headRow={DROPDOWN_HEAD_ROW}
                RowComponent={DropdownTableRow}
              />
            </td>
          </tr>
        )}
      </>
    );
  }
);

const DropdownTableRow = ErrorBoundaryHoc(
  ({
    item: {
      goods_type_name,
      tnved,
      place_count,
      weight,
      volume,
      tariff,
      cost,
      currency,
      unit_of_measure,
    },
  }) => {
    const { t } = useTranslation();

    return (
      <tr>
        <td>
          <span className={tableStyle.text}>{goods_type_name}</span>
        </td>
        <td>
          <p className={tableStyle.text}>
            {tnved?.code} <span style={{ color: '#828282' }}>{tnved?.name}</span>
          </p>
        </td>
        <td>
          <span className={tableStyle.text}>{place_count}</span>
        </td>
        <td>
          <span className={tableStyle.text}>
            {weight} {t('weightKg')}
          </span>
        </td>
        <td>
          <span className={tableStyle.text}>
            {volume} {t('cubicMeter')}
          </span>
        </td>
        <td>
          {tariff && (
            <span className={tableStyle.text}>
              {tariff} {t(unit_of_measure === 'm3' ? 'cubicMeter' : 'weightKg')}
            </span>
          )}
        </td>
        <td>
          {cost && (
            <span className={tableStyle.text}>
              {cost} {currency?.symbol}
            </span>
          )}
        </td>
      </tr>
    );
  }
);
