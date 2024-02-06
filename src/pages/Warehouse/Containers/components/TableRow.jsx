import s from '@components/Table/index.module.scss';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components';
import { useOutsideClick } from '@/hooks';

export const TableRow = ({
  item: {
    id,
    number,
    arriving_date,
    property_type,
    company,
    return_at,
    return_warehouse,
    custom_clearance_state,
    max_weight,
    max_volume,
    container_state,
    status,
    in_warehouse,
    not_in_the_warehouse,
  },
  setUpdateContainerModalId,
  setDeleteContainerModalId,
}) => {
  const [actionOpen, setActionOpen] = useState(false);
  const ref = useRef();
  useOutsideClick(ref, () => setActionOpen(false));
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <tr className={s.clickable} onClick={() => navigate(`/container/${id}`)}>
      <td className={s.text}>{number}</td>
      <td className={s.text}>{arriving_date}</td>
      <td className={s.text}>{property_type?.name}</td>
      <td className={s.text}>{company}</td>
      <td className={s.text}>{return_at}</td>
      <td className={s.text}>{return_warehouse?.name}</td>
      <td className={s.text}>
        <div>{custom_clearance_state?.name}</div>
        <div>{container_state?.name}</div>
      </td>
      <td className={s.text}>
        {max_weight} {t('weightKg')}
      </td>
      <td className={s.text}>
        {max_volume} {t('cubicMeter')}
      </td>
      <td>
        <div className={s.status}>
          <span
            data-status={status?.id}
            data-status-type="container"
            {...(status?.name.length > 15 && { style: { whiteSpace: 'break-spaces' } })}
          >
            {status?.name}
          </span>
        </div>
      </td>
      <td className={s.text}>
        {in_warehouse ? (
          <div className={s.textFlex} style={{ gap: 3 }}>
            <Icon iconId="map" iconWidth={17} iconHeight={16} />
            <span>{in_warehouse.name}</span>
          </div>
        ) : not_in_the_warehouse ? (
          <div className={s.textFlex} style={{ gap: 3 }}>
            <Icon iconId="map" iconWidth={17} iconHeight={16} />
            <span>{not_in_the_warehouse.from_warehouse.name}</span>
            <Icon iconId="arrowRightLong" iconWidth={14} iconHeight={8} />
            <Icon iconId="map" iconWidth={17} iconHeight={16} />
            <span>{not_in_the_warehouse.to_warehouse.name}</span>
          </div>
        ) : null}
      </td>
      <td style={{ position: 'relative' }}>
        <div className={s.actionWrap}>
          <div ref={ref}>
            <Icon
              iconClass={s.actionIcon}
              iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
              onClick={e => {
                e.stopPropagation();
                setActionOpen(!actionOpen);
              }}
              clickable
            />
            <Icon iconId="arrowRight" color="#0B6BE6" />
            {actionOpen && (
              <div className={s.actionDropdown} onClick={e => e.stopPropagation()}>
                <div
                  className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                  onClick={() => setUpdateContainerModalId(id)}
                >
                  <Icon iconId="edit" />
                  <span>{t('modalCreateClientEdit')}</span>
                </div>
                <div
                  className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                  onClick={() => setDeleteContainerModalId(id)}
                >
                  <Icon iconId="trash" />
                  <span>{t('delete')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
