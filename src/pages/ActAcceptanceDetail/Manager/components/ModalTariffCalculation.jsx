import s from '../../index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { uppercase } from '@/helpers';
import clsx from 'clsx';
import { ErrorBoundaryHoc, Modal } from '@components';

const RATE = {
  1: { m3: 'transportationTariffCubicMeterByCargo', kg: 'transportationTariffKgByCargo' },
  2: { m3: 'transportationTariffCubicMeterByAgent', kg: 'transportationTariffKgByAgent' },
  3: { m3: 'transportationTariffCubicMeterByForward', kg: 'transportationTariffKgByForward' },
};

export const ModalTariffCalculation = ErrorBoundaryHoc(({ isOpen, close, calc, contractType }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} close={close} contentStyle={{ width: '100%', maxWidth: 780 }}>
      <h3 className={s.tariffFormulaTitle}>{t('tariffCalculation')}</h3>
      <div className={s.tariffCalcContractTypes}>
        <div>
          <h5 style={{ maxWidth: contractType === 3 ? 'none' : 150 }}>
            {t('transportationTariff')}
          </h5>
          <div className={s.tariffSumBox} style={{ padding: 20 }}>
            <p>
              <span>{t('kgCountInVolume').toLowerCase()}:</span>
              <span>
                {t('from').toLowerCase()} {calc?.transportation_tariff.kg_in_1_cubic_metre_min}{' '}
                {calc?.transportation_tariff.kg_in_1_cubic_metre_max
                  ? `${t('to').toLowerCase()} ${
                      calc.transportation_tariff.kg_in_1_cubic_metre_max
                    } ${t('weightKg')}`
                  : t('andMoreKg')}
              </span>
            </p>
            <p>
              <span>{t('volume/weightCalculation').toLowerCase()}:</span>
              <span>
                1{' '}
                {calc?.transportation_tariff.unit_of_measure === 'm3'
                  ? t('cubicMeter')
                  : t('weightKg')}
              </span>
            </p>
            <p>
              <span>{t('cost').toLowerCase()}:</span>
              <span>{calc?.transportation_tariff.price} $</span>
            </p>
          </div>
        </div>
        {calc?.custom_clearance_tariff && (
          <div>
            <h5 style={{ maxWidth: 180 }}>{t('customsClearanceTariff')}</h5>
            <div className={s.tariffSumBox} style={{ padding: 20 }}>
              <p>
                <span>{t('goodsTypeFilter').toLowerCase()}:</span>
                <span>{calc?.custom_clearance_tariff.goods_type_name}</span>
              </p>
              <p>
                <span>{t('perUnitBilling').toLowerCase()}:</span>
                <span>{uppercase(t(calc?.custom_clearance_tariff.for_piece ? 'yes' : 'no'))}</span>
              </p>
              <p>
                <span>{t('cost').toLowerCase()}:</span>
                <span>{calc?.custom_clearance_tariff.price} $</span>
              </p>
              <p>
                <span>{t('markup').toLowerCase()}:</span>
                <span>{calc?.custom_clearance_tariff.additional_price} $</span>
              </p>
            </div>
          </div>
        )}
        {calc?.document_tariff && (
          <div>
            <h5 style={{ maxWidth: 180 }}>{t('docProcessTariff')}</h5>
            <div className={s.tariffSumBox} style={{ padding: 20 }}>
              {calc?.document_tariff.country && (
                <>
                  <p>
                    <span>{t('clientCountry')}:</span>
                    <span>{calc?.document_tariff.country}</span>
                  </p>
                  <p>
                    <span>{t('percentByCountry').toLowerCase()}:</span>
                    <span>{calc?.document_tariff.percent} %</span>
                  </p>
                </>
              )}
              {calc?.document_tariff.client && (
                <>
                  <p>
                    <span>{t('client').toLowerCase()}:</span>
                    <span>{calc?.document_tariff.client}</span>
                  </p>
                  <p>
                    <span>{t('percentByClient').toLowerCase()}:</span>
                    <span>{calc?.document_tariff.percent} $</span>
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <h4 className={s.tariffFormulaTitle} style={{ fontSize: 18, margin: '50px 0 16px' }}>
        {uppercase(t('sum'))}
        <span style={{ marginLeft: 24 }}>{calc?.cost}$</span>
      </h4>
      <div className={s.tariffCalcOptions} style={{ padding: 20 }}>
        {contractType !== 3 && (
          <div>
            <div style={{ color: '#0B6BE6' }}>
              - cr{' '}
              <div className={clsx(s.optionDropdown, tableStyle.actionDropdown)}>
                <span style={{ color: '#0B6BE6' }}>cr</span> = (fee + a) * w
              </div>
            </div>
            <span>
              ({calc?.fee}$ + {calc?.a}$) * {calc?.w}
              {t('weightKg')} = {calc?.cr}$
            </span>
          </div>
        )}
        <div>
          <div style={{ color: '#EE8234' }}>
            - freight{' '}
            <div className={clsx(s.optionDropdown, tableStyle.actionDropdown)}>
              <span style={{ color: '#EE8234' }}>freight</span> ={' '}
              {calc?.transportation_tariff.unit_of_measure === 'm3' ? 'pv * v' : 'pw * w'}
            </div>
          </div>
          {calc?.transportation_tariff.unit_of_measure === 'm3' ? (
            <span>
              {calc?.pv}$ * {calc?.v}
              {t('cubicMeter')} = {calc?.freight}$
            </span>
          ) : (
            <span>
              {calc?.pw}$ * {calc?.w}
              {t('weightKg')} = {calc?.freight}$
            </span>
          )}
        </div>
        {contractType === 2 && (
          <div>
            <div style={{ color: '#DF3B57' }}>
              - dr{' '}
              <div className={clsx(s.optionDropdown, tableStyle.actionDropdown)}>
                <span style={{ color: '#DF3B57' }}>dr</span> = i * p / 100
              </div>
            </div>
            <span>
              {calc?.i}$ * {calc?.p} / 100 = {calc?.dr}$
            </span>
          </div>
        )}
        {contractType === 3 ? (
          <div>
            <div style={{ color: '#009E61' }}>
              - cost{' '}
              <div className={clsx(s.optionDropdown, tableStyle.actionDropdown)}>
                <span style={{ color: '#009E61' }}>cost</span> ={' '}
                <span style={{ color: '#EE8234' }}>freight</span>
              </div>
            </div>
            <span>{calc?.cost}$</span>
          </div>
        ) : contractType === 1 ? (
          <div>
            <div style={{ color: '#009E61' }}>
              - cost{' '}
              <div className={clsx(s.optionDropdown, tableStyle.actionDropdown)}>
                <span style={{ color: '#009E61' }}>cost</span> ={' '}
                <span style={{ color: '#0B6BE6' }}>cr</span> +{' '}
                <span style={{ color: '#EE8234' }}>freight</span>
              </div>
            </div>
            <span>
              {calc?.cr}$ + {calc?.freight}$ = {calc?.cost}$
            </span>
          </div>
        ) : (
          <div>
            <div style={{ color: '#009E61' }}>
              - cost{' '}
              <div className={clsx(s.optionDropdown, tableStyle.actionDropdown)}>
                <span style={{ color: '#009E61' }}>cost</span> ={' '}
                <span style={{ color: '#0B6BE6' }}>cr</span> +{' '}
                <span style={{ color: '#EE8234' }}>freight</span> +{' '}
                <span style={{ color: '#DF3B57' }}>dr</span>
              </div>
            </div>
            <span>
              {calc?.cr}$ + {calc?.freight}$ + {calc?.dr}$ = {calc?.cost}$
            </span>
          </div>
        )}
      </div>
      <h4 className={s.tariffFormulaTitle} style={{ fontSize: 18, margin: '50px 0 16px' }}>
        {uppercase(t('tariff'))}
        <span style={{ marginLeft: 24 }}>
          {calc?.rate}${' '}
          {t(calc?.transportation_tariff.unit_of_measure === 'm3' ? 'forCubicMeter' : 'forKg')}
        </span>
      </h4>
      <div className={s.tariffCalcOptions} style={{ padding: 20 }}>
        <div>
          <div style={{ color: '#009E61' }}>
            - rate{' '}
            <div className={clsx(s.optionDropdown, tableStyle.actionDropdown)}>
              rate = cost / {calc?.transportation_tariff.unit_of_measure === 'm3' ? 'v' : 'w'}
            </div>
          </div>
          <span>
            {calc?.cost}$ /{' '}
            {calc?.transportation_tariff.unit_of_measure === 'm3'
              ? `${calc?.v}${t('cubicMeter')}`
              : `${calc?.w}${t('weightKg')}`}
            {' = '}
            {calc?.rate}$
          </span>
          <span>{t(RATE[contractType][calc?.transportation_tariff.unit_of_measure])}</span>
        </div>
      </div>
    </Modal>
  );
});
