import s from '../../index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundaryHoc, Modal } from '@components';

const CONTRACT_TYPE = {
  1: {
    title: 'cargoContract',
    formulas: [
      {
        formula: [
          { title: 'cost', color: '#009E61' },
          ' = ',
          { title: 'cr', color: '#0B6BE6' },
          ' + ',
          { title: 'freight', color: '#EE8234' },
        ],
        options: ['formulaCr', 'formulaFreight'],
      },
      {
        formula: [{ title: 'cr', color: '#0B6BE6' }, ' = (fee + a) * w'],
        options: ['formulaFee', 'formulaA', 'formulaW'],
      },
      {
        formula: [{ title: 'freight', color: '#EE8234' }, ' = pv * v'],
        options: ['formulaPv', 'formulaV'],
        description: 'forVolume',
      },
      {
        formula: [{ title: 'freight', color: '#EE8234' }, ' = pw * w'],
        options: ['formulaPw', 'formulaW'],
        description: 'forWeight',
      },
      {
        formula: 'rate = cost / w',
        options: ['formulaRate', 'formulaCost', 'formulaW'],
      },
      {
        formula: 'rate = cost / v',
        options: ['formulaRate', 'formulaCost', 'formulaV'],
      },
    ],
  },
  2: {
    title: 'agentContract',
    formulas: [
      {
        formula: [
          { title: 'cost', color: '#009E61' },
          ' = ',
          { title: 'cr', color: '#0B6BE6' },
          ' + ',
          { title: 'freight', color: '#EE8234' },
          ' + ',
          { title: 'dr', color: '#DF3B57' },
        ],
        options: ['formulaCr', 'formulaFreight', 'formulaDr'],
      },
      {
        formula: [{ title: 'cr', color: '#0B6BE6' }, ' = (fee + a) * w'],
        options: ['formulaFee', 'formulaA', 'formulaW'],
      },
      {
        formula: [{ title: 'freight', color: '#EE8234' }, ' = pv * v'],
        options: ['formulaPv', 'formulaV'],
        description: 'forVolume',
      },
      {
        formula: [{ title: 'freight', color: '#EE8234' }, ' = pw * w'],
        options: ['formulaPw', 'formulaW'],
        description: 'forWeight',
      },
      {
        formula: [{ title: 'dr', color: '#DF3B57' }, ' = i * p / 100'],
        options: ['formulaI', 'formulaP'],
      },
      {
        formula: 'rate = cost / w',
        options: ['formulaRate', 'formulaCost', 'formulaW'],
      },
      {
        formula: 'rate = cost / v',
        options: ['formulaRate', 'formulaCost', 'formulaV'],
      },
    ],
  },
  3: {
    title: 'forwarderContract',
    formulas: [
      {
        formula: [
          { title: 'cost', color: '#009E61' },
          ' = ',
          { title: 'freight', color: '#EE8234' },
        ],
        options: ['formulaFreight'],
      },
      {
        formula: [{ title: 'freight', color: '#EE8234' }, ' = pv * v'],
        options: ['formulaPv', 'formulaV'],
        description: 'forVolume',
      },
      {
        formula: [{ title: 'freight', color: '#EE8234' }, ' = pw * w'],
        options: ['formulaPw', 'formulaW'],
        description: 'forWeight',
      },
      {
        formula: 'rate = cost / w',
        options: ['formulaRate', 'formulaCost', 'formulaW'],
      },
      {
        formula: 'rate = cost / v',
        options: ['formulaRate', 'formulaCost', 'formulaV'],
      },
    ],
  },
};

export const ModalTariffFormula = ErrorBoundaryHoc(({ isOpen, close, contractType }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} close={close} contentStyle={{ width: '100%', maxWidth: 780 }}>
      <h3 className={s.tariffFormulaTitle}>{t(CONTRACT_TYPE[contractType]?.title)}</h3>
      <div className={s.tariffFormula}>
        {CONTRACT_TYPE[contractType]?.formulas.map(({ formula, options, description }, index) => (
          <div key={index} className={s.tariffFormulaRow}>
            <div style={{ fontSize: 14 }}>
              <Formula formula={formula} />
              {description && <div style={{ marginTop: 4, fontWeight: 300 }}>{t(description)}</div>}
            </div>
            <div className={s.options}>
              {options.map((option, index) => (
                <p key={index}>{t(option)}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
});

function Formula({ formula }) {
  if (typeof formula === 'string') return <span>{formula}</span>;

  return (
    <div>
      {formula.map((f, index) => {
        if (typeof f === 'string') return <span key={index}>{f}</span>;

        return (
          <span key={index} style={{ color: f.color }}>
            {f.title}
          </span>
        );
      })}
    </div>
  );
}
