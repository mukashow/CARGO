import s from '../index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Box, ErrorBoundaryHoc, Icon } from '@components';

export const Sidebar = ErrorBoundaryHoc(() => {
  const { t } = useTranslation();

  return (
    <Box className={s.sidebar}>
      <Icon iconId="threeSquare" iconClass={s.threeSquare} />
      <div className={s.group}>
        <div>
          <h4 className={s.groupTitle}>
            <Icon iconId="mapMedium" iconWidth={21} iconHeight={21} />
            Кыргызстан
          </h4>
          <div className={clsx(s.optionsWrap, s.active)}>
            <table className={s.options}>
              <tbody>
                <tr>
                  <td colSpan={3}>
                    <div className={clsx(s.option, s.heading)}>
                      <p className={s.optionTitle}>{t('warehouse')}</p>
                      <p className={s.multipleValues}>
                        <span>China</span>
                        <span>Baby</span>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('noun')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('cashMoney')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('nonCash')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={clsx(s.optionTitle, s.danger)}>{t('debts')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={s.optionsWrap}>
            <table className={s.options}>
              <tbody>
                <tr>
                  <td colSpan={3}>
                    <div className={clsx(s.option, s.heading)}>
                      <p className={s.optionTitle}>{t('warehouse')}</p>
                      <p className={s.multipleValues}>
                        <span>China</span>
                        <span>Baby</span>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('noun')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('cashMoney')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('nonCash')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={clsx(s.optionTitle, s.danger)}>{t('debts')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 className={s.groupTitle}>
            <Icon iconId="mapMedium" iconWidth={21} iconHeight={21} />
            Кыргызстан
          </h4>
          <div className={s.optionsWrap}>
            <table className={s.options}>
              <tbody>
                <tr>
                  <td colSpan={3}>
                    <div className={clsx(s.option, s.heading)}>
                      <p className={s.optionTitle}>{t('warehouse')}</p>
                      <p className={s.multipleValues}>
                        <span>China</span>
                        <span>Baby</span>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('noun')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('cashMoney')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('nonCash')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={clsx(s.optionTitle, s.danger)}>{t('debts')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={s.optionsWrap}>
            <table className={s.options}>
              <tbody>
                <tr>
                  <td colSpan={3}>
                    <div className={clsx(s.option, s.heading)}>
                      <p className={s.optionTitle}>{t('warehouse')}</p>
                      <p className={s.multipleValues}>
                        <span>China</span>
                        <span>Baby</span>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('noun')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('cashMoney')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={s.optionTitle}>{t('nonCash')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
                <tr>
                  <td className={clsx(s.optionTitle, s.danger)}>{t('debts')}:</td>
                  <td className={s.option}>50 000 $</td>
                  <td className={s.option}>50 000 $</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Box>
  );
});
