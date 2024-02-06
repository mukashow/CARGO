import React, { useRef, useState } from 'react';
import s from '@components/Table/index.module.scss';
import { useTranslation } from 'react-i18next';
import { Icon, Table } from '@/components';
import { useOutsideClick } from '@/hooks';

const HEAD_ROW = [
  'goodsType',
  'tnVedCode',
  'seatsNumber',
  'weight',
  'volume',
  'pieces',
  'tableDocAction',
];

export const GoodsTable = ({ goods, onViewPlace }) => {
  return (
    <Table
      RowComponent={Row}
      headRow={HEAD_ROW}
      row={goods}
      rowProps={{ onViewPlace }}
      withBorder
      emptyMessage="waitingForCargoEntered"
    />
  );
};

const Row = ({
  item: { goods_type_name, tnved, place_count, weight, volume, pieces },
  onViewPlace,
}) => {
  const { t } = useTranslation();
  const [actionOpen, setActionOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setActionOpen(false));

  return (
    <tr>
      <td>
        <div className={s.text}>{goods_type_name}</div>
      </td>
      <td>
        <div className={s.text}>{tnved?.code}</div>
        <div className={s.text} style={{ color: '#828282' }}>
          {tnved?.name}
        </div>
      </td>
      <td>
        <div className={s.text}>
          {place_count} {place_count === 1 ? t('seat') : t('seats')}
        </div>
      </td>
      <td>
        <div className={s.text}>
          {weight} {t('weightKg')}
        </div>
      </td>
      <td>
        <div className={s.text}>
          {volume} {t('cubicMeter')}
        </div>
      </td>
      <td>
        <div className={s.text}>{pieces}</div>
      </td>
      <td style={{ position: 'relative' }}>
        <div className={s.actionWrap}>
          <div ref={ref}>
            <Icon
              iconClass={s.actionIcon}
              iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
              onClick={() => setActionOpen(!actionOpen)}
              clickable
            />
            {actionOpen && (
              <div className={s.actionDropdown}>
                <div className={s.actionDropdownButton} onClick={() => onViewPlace(tnved.id)}>
                  <Icon iconId="menuList" color="#0B6BE6" clickable />
                  <span>{t('decodingCargo')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
