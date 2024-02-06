import mainStyle from '../../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Icon, Table } from '@/components';
import { fetchGoodsTariffCalculation } from '@actions';
import { useOutsideClick } from '@/hooks';
import { ModalTariffCalculation } from './ModalTariffCalculation';
import { ModalTariffFormula } from './ModalTariffFormula';

export const GoodsTable = ({ goods, currencySymbol, onViewPlace }) => {
  const goodsDetail = useSelector(state => state.goods.goodsDetail);
  const role = useSelector(state => state.auth.user.role_id);
  const [modalTariffFormula, setModalTariffFormula] = useState(false);
  const [modalCargoTariffCalc, setModalCargoTariffCalc] = useState(null);
  const [calc, setCalc] = useState(null);
  const dispatch = useDispatch();
  const { actId } = useParams();

  const row = useMemo(() => {
    const HEAD_ROW = [
      'goodsType',
      'tnVedCode',
      'seatsNumber',
      'weight',
      'volume',
      { title: 'cargoDensity', icon: 'density', tooltip: 'densityFormula' },
      'pieces',
      {
        title: 'tariff',
        icon: 'question',
        onIconClick: () => setModalTariffFormula(true),
      },
      'sum',
      'tableDocAction',
    ];
    let data = HEAD_ROW;

    if (role !== 1 && role !== 5) {
      data = [];
      HEAD_ROW.forEach(th => {
        if (th.title !== 'cargoDensity') {
          if (th.title === 'tariff') {
            return data.push(th.title);
          }
          data.push(th);
        }
      });
    }

    return data;
  }, []);

  useEffect(() => {
    if (modalCargoTariffCalc) {
      dispatch(fetchGoodsTariffCalculation({ id: actId, tnved: modalCargoTariffCalc }))
        .unwrap()
        .then(setCalc);
    }
  }, [modalCargoTariffCalc]);

  return (
    <>
      <Table
        RowComponent={Row}
        headRow={row}
        row={goods}
        rowProps={{ currencySymbol, onViewPlace, setModalCargoTariffCalc }}
        withBorder
        emptyMessage="waitingForCargoEntered"
        className={mainStyle.goodsTable}
      />
      {goodsDetail.contract_type && (
        <>
          <ModalTariffFormula
            contractType={goodsDetail.contract_type.id}
            isOpen={modalTariffFormula}
            close={() => setModalTariffFormula(false)}
          />
          <ModalTariffCalculation
            isOpen={!!modalCargoTariffCalc}
            close={() => setModalCargoTariffCalc(null)}
            calc={calc}
            contractType={goodsDetail.contract_type.id}
          />
        </>
      )}
    </>
  );
};

const Row = React.memo(
  ({
    item: {
      goods_type_name,
      tnved,
      place_count,
      weight,
      volume,
      tariff,
      cost,
      pieces,
      has_missing_tariff,
      missing_tariff_msg,
      unit_of_measure,
      cargo_density,
    },
    index,
    currencySymbol,
    onViewPlace,
    setModalCargoTariffCalc,
  }) => {
    const role = useSelector(state => state.auth.user.role_id);
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
          <p className={s.text}>{tnved?.code}</p>
          <p className={s.text} style={{ color: '#828282' }}>
            {tnved?.name}
          </p>
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
        {(role === 1 || role === 5) && <td className={s.text}>{cargo_density} ρ</td>}
        <td>
          <div className={s.text}>{pieces}</div>
        </td>
        <td>
          {tariff && (
            <div className={s.text}>
              {tariff} {t(unit_of_measure === 'm3' ? 'cubicMeter' : 'weightKg')}
            </div>
          )}
          {has_missing_tariff && (
            <div>
              <a data-tip data-for={`tariff-${index}`}>
                <Icon iconId="alert" color="#DF3B57" />
              </a>
              <ReactTooltip id={`tariff-${index}`}>
                <span>{missing_tariff_msg}</span>
              </ReactTooltip>
            </div>
          )}
        </td>
        <td>
          <div className={s.text}>
            {cost} {currencySymbol}
          </div>
        </td>
        <td style={{ position: 'relative' }}>
          <div className={s.actionWrap}>
            {!has_missing_tariff && (
              <Icon
                iconClass={s.iconQuestion}
                iconId="question"
                clickable
                iconWidth={21}
                iconHeight={21}
                color="#9795A4"
                onClick={() => setModalCargoTariffCalc(tnved.id)}
              />
            )}
            <div ref={ref}>
              <Icon
                iconClass={s.actionIcon}
                iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                onClick={() => setActionOpen(!actionOpen)}
                clickable
              />
              {actionOpen && (
                <div className={s.actionDropdown}>
                  <div className={s.actionDropdownButton} onClick={() => onViewPlace(tnved?.id)}>
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
  }
);
