import s from '@components/Table/index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundaryHoc, TableChain } from '@/components';

export const TableRow = ErrorBoundaryHoc(
  ({
    item: {
      id,
      sent_at,
      car_number,
      driver_name,
      last_warehouse,
      route,
      status_name,
      status,
      transportation_type,
      total,
    },
  }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
      <tr onClick={() => navigate(`/loading_list/${id}`)} className={s.clickable}>
        <td>
          <span className={s.text}>#{id}</span>
        </td>
        <td>
          <span className={s.text}>{sent_at?.slice(0, 10)}</span>
        </td>
        <td>
          <span className={s.text}>{transportation_type?.name}</span>
        </td>
        <td style={{ maxWidth: 400 }}>
          <TableChain chain={route.map(({ name }) => ({ title: name }))} />
        </td>
        <td>
          <span className={s.text}>{driver_name}</span>
        </td>
        <td>
          <span className={s.text}>{car_number}</span>
        </td>
        <td style={{ maxWidth: 450 }}>
          <span className={s.text}>
            {total.place_count || 0} {t(total.place_count === 1 ? 'seat' : 'seats')}
          </span>
        </td>
        <td>
          <span className={s.text}>
            {total.weight || 0} {t('weightKg')}
          </span>
        </td>
        <td>
          <span className={s.text}>
            {total.volume || 0} {t('cubicMeter')}
          </span>
        </td>
        <td>
          <div className={s.status}>
            <span
              data-status={status}
              data-status-type="loadingList"
              {...(status_name.length > 15 && { style: { whiteSpace: 'break-spaces' } })}
            >
              {status_name}
            </span>
          </div>
        </td>
        <td style={{ minWidth: 150 }}>
          <span className={s.text}>{last_warehouse?.name}</span>
        </td>
      </tr>
    );
  }
);
