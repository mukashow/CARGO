import docTableStyle from '@components/DocumentsTable/index.module.scss';
import s from '@components/Table/index.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { usePopper } from 'react-popper';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  createExpense,
  fetchAllCurrencies,
  fetchDocumentExpenses,
  fetchExpenseOne,
  fetchExpenseType,
  setExpenseInjectMode,
  updateExpense,
} from '@/store/actions';
import clsx from 'clsx';
import { ErrorBoundaryHoc, Icon, Input, SelectCustom } from '@/components';
import { useOutsideClick } from '@/hooks';

export const Row = ErrorBoundaryHoc(
  ({
    item,
    setCancelConfirmModal,
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
    setLoading,
    setIdToDelete,
    expenseInjectingMode,
    tabConfirmFn,
  }) => {
    const { loadingListId, actId } = useParams();
    const doc_type = loadingListId ? 'loadingList' : 'goods';
    const docTypeDetailKey = loadingListId ? 'loadingListDetail' : 'goodsDetail';
    const expenseType = useSelector(state => state.documents.expenseType[doc_type]);
    const documentDetail = useSelector(state => state[doc_type][docTypeDetailKey]);
    const currencies = useSelector(state => state.currency.allCurrencies);
    const [actionOpen, setActionOpen] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentDropdownRef, setCommentDropdownRef] = useState(null);
    const [commentWrapRef, setCommentWrapRef] = useState(null);
    const [commentWidth, setCommentWidth] = useState(200);
    const [showToggle, setShowToggle] = useState(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const ref = useRef(null);
    const commentRef = useRef(null);
    useOutsideClick(ref, () => setActionOpen(false));
    useOutsideClick({ current: commentDropdownRef }, () => setCommentOpen(false));
    const {
      id,
      extra_costs_type,
      extra_costs_type_name,
      comment,
      cost,
      currency_symbol,
      currency,
      currency_name,
      createMode,
      editMode,
    } = item;

    const commentPopper = usePopper(commentWrapRef, commentDropdownRef, {
      placement: 'right-start',
      modifiers: {
        name: 'offset',
        options: {
          offset: [
            0,
            commentWrapRef
              ? -Math.abs(commentWrapRef.clientWidth - (window.innerWidth > 1440 ? 30 : 12))
              : 0,
          ],
        },
      },
    });

    const onSubmit = async values => {
      try {
        const conf = { document: Number(loadingListId || actId), ...values };
        if (editMode) {
          await dispatch(updateExpense({ ...conf, id })).unwrap();
        } else {
          await dispatch(createExpense(conf)).unwrap();
        }
        setLoading(true);
        await dispatch(fetchDocumentExpenses(loadingListId || actId));
        reset();
      } catch (errors) {
        for (const key in errors) {
          setError(key, { message: errors[key] });
        }
      } finally {
        setLoading(false);
      }
    };

    const onDelete = useCallback(() => {
      if (!expenseInjectingMode) return setIdToDelete(id);
      setCancelConfirmModal(true);
      tabConfirmFn.current = () => setIdToDelete(id);
    }, [expenseInjectingMode]);

    const onEdit = useCallback(() => {
      const toggleEditMode = () => {
        dispatch(setExpenseInjectMode({ type: 'edit', id }));
        dispatch(fetchExpenseOne(id));
        setActionOpen(false);
      };

      if (!expenseInjectingMode) return toggleEditMode();

      setCancelConfirmModal(true);
      tabConfirmFn.current = toggleEditMode;
    }, [expenseInjectingMode]);

    useEffect(() => {
      if (commentWrapRef) {
        setCommentWidth(
          commentWrapRef.offsetParent.clientWidth -
            commentWrapRef.offsetLeft -
            (window.innerWidth > 1440 ? 30 : 12)
        );
      }
    }, [commentWrapRef]);

    useEffect(() => {
      if (editMode) {
        setValue('extra_costs_type', { value: extra_costs_type, label: extra_costs_type_name });
        setValue('comment', comment);
        commentRef.current.style.height = commentRef.current.scrollHeight + 'px';
        setValue('cost', cost);
        setValue('currency', { label: currency_name, value: currency });
      }

      return reset;
    }, [item]);

    useEffect(() => {
      if (createMode || editMode) {
        dispatch(
          fetchExpenseType({
            doc_type_id: documentDetail.doc_type_id,
            doc_type,
          })
        );
        dispatch(fetchAllCurrencies());
      }
    }, [createMode, editMode]);

    if (createMode || editMode) {
      return (
        <tr style={{ verticalAlign: 'top' }}>
          <td style={{ paddingTop: 12, paddingBottom: 12 }}>
            <SelectCustom
              options={expenseType?.results.map(({ id, name }) => ({ label: name, value: id }))}
              small
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder={t('entering')}
              name="extra_costs_type"
              control={control}
              error={errors.extra_costs_type?.message}
              {...(focusedField === 'extra_costs_type' && {
                containerStyle: { borderColor: '#009E61' },
                dropdownIndicatorColor: '#009E61',
              })}
              onFocus={() => setFocusedField('extra_costs_type')}
              onBlur={() => setFocusedField(null)}
              onMenuOpen={() =>
                dispatch(
                  fetchExpenseType({
                    doc_type_id: documentDetail.doc_type_id,
                    doc_type,
                  })
                )
              }
              style={{ width: 180 }}
            />
          </td>
          <td style={{ paddingTop: 12, paddingBottom: 12 }}>
            <Input
              small
              multiline
              placeholder={t('entering')}
              name="comment"
              register={register}
              errors={errors.comment?.message}
              passRef={commentRef}
              style={{
                minHeight: 32,
                height: 'auto',
                maxHeight: 150,
                padding: '7px 12px',
                color: '#232323',
                ...(focusedField === 'comment' && { borderColor: '#009E61' }),
              }}
              rows={1}
              onFocus={() => setFocusedField('comment')}
              onBlur={() => setFocusedField(null)}
            />
          </td>
          <td style={{ paddingTop: 12, paddingBottom: 12 }}>
            <div className={s.textFlex} style={{ alignItems: 'flex-start' }}>
              <Input
                small
                placeholder={t('entering')}
                name="cost"
                register={register}
                style={{
                  fontSize: 12,
                  ...(focusedField === 'cost' && { borderColor: '#009E61' }),
                }}
                containerStyle={{ marginRight: 10, width: 150 }}
                errors={errors.cost?.message}
                onFocus={() => setFocusedField('cost')}
                onBlur={() => setFocusedField(null)}
              />
              <SelectCustom
                onMenuOpen={() => dispatch(fetchAllCurrencies())}
                small
                placeholder={t('entering')}
                name="currency"
                control={control}
                options={currencies}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                error={errors.currency?.message}
                style={{ width: 140 }}
                {...(focusedField === 'currency' && {
                  containerStyle: { borderColor: '#009E61' },
                  dropdownIndicatorColor: '#009E61',
                })}
                onFocus={() => setFocusedField('currency')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </td>
          <td style={{ paddingTop: 16, paddingBottom: 12 }}>
            <div className={s.textFlex}>
              <Icon
                iconId="access"
                style={{ marginRight: 12 }}
                color="#009E61"
                clickable
                onClick={handleSubmit(onSubmit)}
              />
              <Icon
                iconId="cross"
                color="#DF3B57"
                clickable
                onClick={() => {
                  setCancelConfirmModal(true);
                  tabConfirmFn.current = () => dispatch(setExpenseInjectMode({ type: 'cancel' }));
                }}
              />
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td className={s.text}>{extra_costs_type_name}</td>
        <td
          className={s.text}
          style={{ position: 'relative', paddingTop: 10, paddingBottom: 10 }}
          ref={setCommentWrapRef}
        >
          <div
            className={clsx(s.text, docTableStyle.comment)}
            ref={el => {
              if (el) {
                setShowToggle(el.scrollHeight > el.clientHeight);
              }
            }}
          >
            {comment}
          </div>
          {showToggle && (
            <div
              className={docTableStyle.commentToggle}
              style={{ visibility: commentOpen ? 'hidden' : 'visible' }}
            >
              <p onClick={() => setCommentOpen(!commentOpen)}>{t('readMore')}</p>
            </div>
          )}
          {commentOpen &&
            createPortal(
              <div
                className={docTableStyle.commentDropdown}
                ref={setCommentDropdownRef}
                style={{ ...commentPopper.styles.popper, maxWidth: commentWidth }}
                {...commentPopper.attributes}
              >
                {comment}
              </div>,
              document.body
            )}
        </td>
        <td className={s.text}>
          {cost} {currency_symbol}
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
                  <div className={s.actionDropdownButton} onClick={onEdit}>
                    <Icon iconId="edit" color="#0B6BE6" />
                    <span>{t('modalCreateClientEdit')}</span>
                  </div>
                  <div className={s.actionDropdownButton} onClick={onDelete}>
                    <Icon iconId="trash" color="#DF3B57" />
                    <span>{t('delete')}</span>
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
