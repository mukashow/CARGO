import s from '@components/Table/index.module.scss';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon, TableChain } from '@/components';
import { useOutsideClick } from '@/hooks';

export const TableRow = ({
  item: {
    id,
    created_at,
    receiver,
    place_count,
    weight,
    volume,
    direction,
    cost,
    currency,
    status,
    tags,
    is_expired,
    warehouse,
  },
  roleId,
  warehouseId,
}) => {
  const [actionOpen, setActionOpen] = useState(false);
  const ref = useRef();
  useOutsideClick(ref, () => setActionOpen(false));
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <tr onClick={() => navigate(`/goods_act_acceptance/${id}`)} className={s.clickable}>
      <td>
        <span className={s.text}>#{id}</span>
      </td>
      <td>
        <span className={s.text}>{created_at.slice(0, 10)}</span>
      </td>
      <td>
        <span className={s.text}>{receiver.code}</span>
      </td>
      <td>
        <span className={s.text}>
          {place_count} {place_count === 1 ? t('seat') : t('seats')}
        </span>
      </td>
      <td>
        <span className={s.text}>
          {Number(weight)} {t('weightKg')}
        </span>
      </td>
      <td>
        <span className={s.text}>
          {Number(volume)} {t('cubicMeter')}
        </span>
      </td>
      <td style={{ maxWidth: 450 }}>
        <TableChain
          chain={
            direction.custom_clearance_country_name
              ? [
                  { title: direction.point_from_name },
                  { title: direction.custom_clearance_country_name },
                  { title: direction.point_to_name },
                ]
              : [{ title: direction.point_from_name }, { title: direction.point_to_name }]
          }
        />
      </td>
      <td>
        <span className={s.text}>
          {Number(cost)} {currency?.symbol}
        </span>
      </td>
      <td>
        <div className={s.status}>
          <span
            {...(status.name.length > 15 && { style: { whiteSpace: 'break-spaces' } })}
            data-status={status.id}
            data-status-type="goodsAcceptance"
          >
            {status.name}
          </span>
        </div>
      </td>
      <td>
        <div className={s.textFlex}>
          {is_expired && (
            <div style={{ marginRight: 10 }}>
              <Icon iconId="alert" color="#df3b57" />
            </div>
          )}
          <span className={s.text} style={{ minWidth: 90 }}>
            {tags.map(({ name }) => name).join(', ')}
          </span>
        </div>
      </td>
      {roleId === 5 && !warehouseId && (
        <td>
          <span className={s.text}>{warehouse?.name}</span>
        </td>
      )}
      <td>
        <div className={s.actionWrap}>
          <Icon iconId="arrowRight" color="#0B6BE6" style={{ margin: '0 0 0 auto' }} />
        </div>
      </td>
    </tr>
  );
};
