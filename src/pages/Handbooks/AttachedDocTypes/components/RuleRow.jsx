import mainStyle from '../index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { usePopper } from 'react-popper';
import { useDispatch, useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {
  deleteContainerRestriction,
  deleteContractTypeRestriction,
  deleteDocumentTypeRestriction,
  deleteEmployeeRestriction,
  deleteEmptyRestriction,
  deleteStatusRestriction,
  deleteTransportationTypeRestriction,
  deleteWaypointRestriction,
  fetchRuleDetail,
} from '@/store/actions';
import clsx from 'clsx';
import { ErrorBoundaryHoc, Icon } from '@/components';
import { useOutsideClick } from '@/hooks';

const popperConf = {
  name: 'offset',
  options: {
    offset: ({ placement }) => {
      if (placement === 'left-start') {
        return [-8, -40];
      } else {
        return [8, -40];
      }
    },
  },
};

export const RuleRow = ErrorBoundaryHoc(
  ({
    setLimitationModal,
    setRuleIdToDelete,
    setModalEditRuleId,
    setRestrictionToDelete,
    item: { id, name, rule_details, doc_type_name },
  }) => {
    const description = useSelector(state => state.documents.limitationsDescription);
    const [hoverLimit, setHoverLimit] = useState(null);
    const [actionOpen, setActionOpen] = useState(false);
    const [dropdownRef, setDropdownRef] = useState(null);
    const [dropdownWrapRef, setDropdownWrapRef] = useState(null);
    const [limitIconRef, setLimitIconRef] = useState(null);
    const [limitDropdownRef, setLimitDropdownRef] = useState(null);
    const mouseOnDropdown = useRef(false);
    const { t } = useTranslation();
    useOutsideClick({ current: dropdownRef }, () => setActionOpen(false));
    const dispatch = useDispatch();

    const { styles, attributes } = usePopper(dropdownWrapRef, dropdownRef, {
      placement: 'right-start',
      modifiers: {
        name: 'offset',
        options: {
          offset: [0, dropdownWrapRef ? -Math.abs(dropdownWrapRef.clientWidth + 24) : 0],
        },
      },
    });

    const { styles: limitStyles, attributes: limitAttributes } = usePopper(
      limitIconRef,
      limitDropdownRef,
      { placement: 'left-start', modifiers: [popperConf] }
    );

    const rules = useMemo(() => {
      const {
        status,
        route_point,
        transportation_type,
        contract_type,
        worker,
        document_type,
        void: empty,
        must_have_container,
      } = rule_details;

      return [
        document_type && {
          ...document_type,
          key: 'document_type',
          deleteTitle: 'toDeleteDocumentTypeRestriction',
          deleteDescription: 'toDeleteDocumentTypeRestrictionDescription',
          deleteFunc: deleteDocumentTypeRestriction,
          description: description.document_type_description,
          row: [
            { value: t('byDocType') },
            { title: `${t('tableDocType').toLowerCase()}:`, value: document_type.name },
          ],
        },
        empty && {
          ...empty,
          key: 'empty',
          deleteTitle: 'toDeleteEmptyRestriction',
          deleteDescription: 'toDeleteEmptyRestrictionDescription',
          deleteFunc: deleteEmptyRestriction,
          description: description.void_description,
          row: [
            { value: t('byEmpty') },
            { title: `${t('name').toLowerCase()}:`, value: empty.name },
          ],
        },
        status && {
          ...status,
          key: 'status',
          deleteTitle: 'toDeleteStatusRestriction',
          deleteDescription: 'toDeleteStatusRestrictionDescription',
          deleteFunc: deleteStatusRestriction,
          description: description.status_description,
          row: [
            { value: t('byLoadingListStatus') },
            { title: `${t('status')}:`, value: status.name },
          ],
        },
        transportation_type && {
          ...transportation_type,
          key: 'transportation_type',
          deleteTitle: 'toDeleteTransportationTypeRestriction',
          deleteDescription: 'toDeleteTransportationTypeRestrictionDescription',
          deleteFunc: deleteTransportationTypeRestriction,
          description: description.transportation_type_description,
          row: [
            { value: t('byTransportationType') },
            { title: t('transportationType'), value: transportation_type.name },
          ],
        },
        route_point && {
          ...route_point,
          key: 'route_point',
          deleteTitle: 'toDeleteWaypointRestriction',
          deleteDescription: 'toDeleteWaypointRestrictionDescription',
          deleteFunc: deleteWaypointRestriction,
          description: description.route_point_description,
          row: [
            { value: t('byLoadingListRoutePoint') },
            { title: `${t('route')}:`, value: route_point.route_name },
            { title: `${t('point').toLowerCase()}:`, value: route_point.point_name },
          ],
        },
        contract_type && {
          ...contract_type,
          key: 'contract_type',
          deleteTitle: 'toDeleteContractTypeRestriction',
          deleteDescription: 'toDeleteContractTypeRestrictionDescription',
          deleteFunc: deleteContractTypeRestriction,
          description: description.contract_type_description,
          row: [
            { value: t('byContractType') },
            { title: `${t('clientContractType')}:`, value: contract_type.name },
          ],
        },
        typeof must_have_container === 'boolean' && {
          key: 'must_have_container',
          deleteTitle: 'toDeleteContainerRestriction',
          deleteDescription: 'toDeleteContainerRestrictionDescription',
          deleteFunc: deleteContainerRestriction,
          description: description.container_description,
          row: [
            { value: t('byLoadingListContainer') },
            {
              title: `${t('containerRequired').toLowerCase()}:`,
              value: t(must_have_container ? 'yes' : 'no'),
            },
          ],
        },
        worker && {
          ...worker,
          key: 'worker',
          deleteTitle: 'toDeleteEmployeeRestriction',
          deleteDescription: 'toDeleteEmployeeRestrictionDescription',
          deleteFunc: deleteEmployeeRestriction,
          description: description.worker_description,
          row: [
            { value: t('byEmployee') },
            { title: `${t('employee').toLowerCase()}:`, value: worker.name },
          ],
        },
      ]
        .filter(item => !!item)
        .sort((a, b) => {
          const startA = a.key.match(/document_type|empty/);
          const startB = b.key.match(/document_type|empty/);
          const endA = a.key === 'worker';
          const endB = b.key === 'worker';
          if (!startA && startB) return 1;
          if (startA && !startB) return -1;
          if (!endA && endB) return -1;
          if (endA && !endB) return 1;
          return a.row[0].value.localeCompare(b.row[0].value);
        });
    }, [description, rule_details]);

    return (
      <tr valign="top" className={mainStyle.ruleRow}>
        <td className={clsx(s.textFlex, s.text)}>
          {!rule_details.document_type && !rule_details.empty && (
            <>
              <a data-tip data-for="noLimit" style={{ marginRight: 6, height: 24 }}>
                <Icon iconId="alert" color="#DF3B57" />
              </a>
              <ReactTooltip id="noLimit">
                <span>{t('noActionLimit')}</span>
              </ReactTooltip>
            </>
          )}
          {name}
        </td>
        <td colSpan={window.innerWidth > 1440 ? 5 : 3}>
          <div className={mainStyle.ruleCards}>
            {rules.map(({ row, key, description, deleteTitle, deleteDescription, deleteFunc }) => (
              <div key={key} className={mainStyle.card}>
                {row.map(({ title, value }, index) => (
                  <div key={index} className={mainStyle.row}>
                    <p>{title || t('limitationBy')}</p>
                    <p className={mainStyle.value}>{value}</p>
                  </div>
                ))}
                <div className={mainStyle.cardIcons}>
                  <div style={{ position: 'relative' }}>
                    <Icon
                      iconId="info"
                      color="#828282"
                      style={{ zIndex: hoverLimit === key ? 5 : 1 }}
                      iconClass={mainStyle.cardInfoIcon}
                      ref={hoverLimit === key ? setLimitIconRef : null}
                      onMouseEnter={() => setHoverLimit(key)}
                      onMouseLeave={() => {
                        setTimeout(() => {
                          if (!mouseOnDropdown.current) setHoverLimit(null);
                        });
                      }}
                    />
                    {hoverLimit === key &&
                      createPortal(
                        <div
                          className={clsx(mainStyle.card, mainStyle.limitationCard)}
                          ref={setLimitDropdownRef}
                          style={{
                            ...limitStyles.popper,
                            zIndex: hoverLimit === key ? 4 : 1,
                          }}
                          {...limitAttributes.popper}
                          onMouseEnter={() => {
                            mouseOnDropdown.current = true;
                          }}
                          onMouseLeave={() => {
                            setHoverLimit(null);
                            mouseOnDropdown.current = false;
                          }}
                        >
                          <div className={mainStyle.limitationText}>
                            {limitAttributes.popper?.['data-popper-placement'] === 'left-start' && (
                              <Icon
                                iconId="info"
                                style={{ visibility: 'hidden', float: 'right' }}
                              />
                            )}
                            {description}
                            {limitAttributes.popper?.['data-popper-placement'] === 'left-end' && (
                              <Icon
                                iconId="info"
                                style={{ visibility: 'hidden', float: 'right' }}
                              />
                            )}
                          </div>
                        </div>,
                        document.body
                      )}
                  </div>
                  <Icon
                    iconId="trash"
                    color="#DF3B57"
                    clickable
                    onClick={() => {
                      setRestrictionToDelete({
                        isOpen: true,
                        title: deleteTitle,
                        description: deleteDescription,
                        id,
                        deleteFunc,
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </td>
        <td ref={setDropdownWrapRef}>
          <Icon
            iconClass={s.actionIcon}
            color="#828282"
            iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
            onClick={() => setActionOpen(!actionOpen)}
            clickable
          />
          {actionOpen &&
            createPortal(
              <div
                className={s.actionDropdown}
                ref={setDropdownRef}
                style={styles.popper}
                {...attributes.popper}
                onClick={e => e.stopPropagation()}
              >
                <div
                  className={s.actionDropdownButton}
                  onClick={() => {
                    dispatch(fetchRuleDetail(id));
                    setModalEditRuleId({ id, name: doc_type_name });
                  }}
                >
                  <Icon iconId="edit" color="#0B6BE6" />
                  <span>{t('editRule')}</span>
                </div>
                <div
                  className={s.actionDropdownButton}
                  onClick={() => setRuleIdToDelete({ id, name: doc_type_name })}
                >
                  <Icon iconId="trash" color="#DF3B57" />
                  <span>{t('deleteRule')}</span>
                </div>
                <div className={s.actionDropdownButton} style={{ cursor: 'default' }}>
                  <Icon iconId="plusCircle" color="#004BAB" />
                  <span>{t('addLimitationBy')}</span>
                </div>
                <div className={mainStyle.createLimitDropdownWrap}>
                  <p className={mainStyle.createLimitGroupTitle}>{t('actionLimit')}</p>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'empty', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byEmpty')}</span>
                    <p className={mainStyle.createLimitDropdown}>{description.void_description}</p>
                  </div>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'docType', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byDocType')}</span>
                    <p className={mainStyle.createLimitDropdown}>
                      {description.document_type_description}
                    </p>
                  </div>
                  <p className={mainStyle.createLimitGroupTitle}>{t('basicLimit')}</p>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'status', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byLoadingListStatus')}</span>
                    <p className={mainStyle.createLimitDropdown}>
                      {description.status_description}
                    </p>
                  </div>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'transportationType', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byTransportationType')}</span>
                    <p className={mainStyle.createLimitDropdown}>
                      {description.transportation_type_description}
                    </p>
                  </div>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'waypoint', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byLoadingListRoutePoint')}</span>
                    <p className={mainStyle.createLimitDropdown}>
                      {description.route_point_description}
                    </p>
                  </div>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'contractType', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byContractType')}</span>
                    <p className={mainStyle.createLimitDropdown}>
                      {description.contract_type_description}
                    </p>
                  </div>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'container', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byLoadingListContainer')}</span>
                    <p className={mainStyle.createLimitDropdown}>
                      {description.container_description}
                    </p>
                  </div>
                  <p className={mainStyle.createLimitGroupTitle}>{t('accessLimit')}</p>
                  <div
                    className={clsx(s.actionDropdownButton, mainStyle.createLimitBtn)}
                    onClick={() => setLimitationModal({ type: 'employee', id })}
                  >
                    <span style={{ color: '#004BAB' }}>{t('byEmployee')}</span>
                    <p className={mainStyle.createLimitDropdown}>
                      {description.worker_description}
                    </p>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </td>
      </tr>
    );
  }
);
