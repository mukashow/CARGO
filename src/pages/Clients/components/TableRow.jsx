import s from '@components/Table/index.module.scss';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundaryHoc, Icon } from '@/components';
import { useOutsideClick } from '@/hooks';

export const TableRow = ErrorBoundaryHoc(({ item, onEditClient }) => {
  const [isShow, setIsShow] = useState(false);
  const { t } = useTranslation();
  const ref = useRef(null);
  useOutsideClick(ref, () => setIsShow(false));
  const navigate = useNavigate();

  const editClient = () => {
    onEditClient(item.id);
    setIsShow(false);
  };

  return (
    <tr onClick={() => navigate(`${item.id}`)} className={s.clickable}>
      <td>
        <div className={s.text}>{item.code}</div>
      </td>
      <td>
        <div className={`${s.text} ${s.textFlex}`}>
          {item.has_required_document && (
            <div className={s.alertIcon} data-tip={t('tableClientTooltip')}>
              <Icon iconId="alert" />
            </div>
          )}
          {item.name} {item.last_name} {item.otchestvo}
        </div>
      </td>
      <td>
        {item.phones.map((itemChildren, index) => (
          <div key={itemChildren.id || index} className={s.text}>
            {itemChildren.country_code}
            {itemChildren.number}
          </div>
        ))}
      </td>
      <td>
        <div className={s.text}>{item.username}</div>
      </td>
      <td>
        <div className={s.text}>{item.address}</div>
      </td>
      <td style={{ position: 'relative' }}>
        <div className={s.actionWrap}>
          <div ref={ref}>
            <Icon
              iconClass={s.actionIcon}
              iconId={isShow ? 'cross' : 'dotsThreeCircle'}
              onClick={e => {
                e.stopPropagation();
                setIsShow(!isShow);
              }}
              clickable
            />
            <Icon iconId="arrowRight" color="#0B6BE6" />
            {isShow && (
              <div className={s.actionDropdown} onClick={e => e.stopPropagation()}>
                <div
                  className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                  onClick={editClient}
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
});
