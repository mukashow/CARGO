import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { returnForRevision } from '@/store/actions';
import * as yup from 'yup';
import { ErrorBoundaryHoc, Input, Modal, Table } from '@/components';
import { useYupValidationResolver } from '@/hooks';
import { RevisionTableRow } from './RevisionTableRow';

const HEAD_ROW = [
  'clientCodeClient',
  'goodsTypeFilter',
  'tnVedCode',
  'seatsNumber',
  'weight',
  'volume',
  'tableDocComment',
];

export const ModalRevision = ErrorBoundaryHoc(({ isOpen, close, fetchLoadingList }) => {
  const goods = useSelector(state => state.loadingList.loadingListDetail?.goods_list);
  const [checkedActs, setCheckedActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loadingListId } = useParams();

  const commentsSchema = {
    comment: yup.lazy((_, { from, parent }) => {
      if (parent.checked && !from[1].value.comment) {
        return yup
          .string()
          .nullable()
          .required(t('returnForRevisionModalError'))
          .max(500, `${t('maxCharactersLength')} 500`);
      }
      return yup
        .string()
        .nullable()
        .max(500, `${t('maxCharactersLength')} 500`);
    }),
  };
  const commentSchema = yup.lazy((_, { parent, originalValue }) => {
    const checkedGoods = parent.comments?.filter(({ checked }) => !!checked);

    if (checkedGoods?.length && !checkedGoods.every(({ comment }) => !!comment) && !originalValue) {
      return yup
        .string()
        .required(t('returnForRevisionModalError'))
        .max(1000, `${t('maxCharactersLength')} 1000`);
    }
    return yup.string().max(1000, `${t('maxCharactersLength')} 1000`);
  });
  const schema = yup.object().shape({
    comments: yup.array().of(yup.object().shape(commentsSchema)),
    comment: commentSchema,
  });
  const resolver = useYupValidationResolver(schema);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    trigger,
  } = useForm({
    resolver,
    defaultValues: {
      comments: [],
      comment: '',
    },
  });
  const { fields, append, update } = useFieldArray({
    control,
    name: 'comments',
  });
  const comments = watch('comments');

  const onCheckAll = () => {
    fields.forEach((item, index) => {
      update(index, { ...item, checked: !fields.every(({ checked }) => !!checked) });
    });
  };

  const onSubmit = async values => {
    setLoading(true);
    if (values.comments.some(({ checked, comment }) => !checked && !!comment)) {
      setLoading(false);
      return toast.warn(t('selectGoodsToRevisionDescription'));
    }
    if (!values.comments.some(({ checked }) => !!checked)) {
      fields.forEach((item, index) => {
        update(index, { ...item, comment: '' });
      });

      if (!values.comment) {
        setLoading(false);
        return close();
      }
    }
    await dispatch(returnForRevision({ id: loadingListId, values }));
    close();
    fetchLoadingList();
    setLoading(false);
  };

  useEffect(() => {
    if (goods) {
      reset();
      append(goods);
    }
  }, [goods]);

  return (
    <Modal
      isOpen={isOpen}
      close={close}
      contentStyle={{ padding: 0, width: '100%', maxWidth: 1610, height: '100%' }}
      outsideCloseBtn
      overflow="visible"
    >
      <Table
        selectable
        rootTableStyle={{
          borderRadius: '4px 4px 0 0',
          overflow: 'hidden',
          position: 'absolute',
          inset: 0,
        }}
        checked={!!fields?.length && fields.every(({ checked }) => !!checked)}
        onSelect={onCheckAll}
        row={comments}
        headRow={HEAD_ROW}
        RowComponent={RevisionTableRow}
        rowProps={{ setCheckedActs, checkedActs, register, update, trigger, errors }}
        emptyMessage="actsListEmpty"
        footerBtnValue={t('returnForRevision')}
        onFooterBtnClick={handleSubmit(onSubmit)}
        footerBtnDisabled={loading}
        className={s.revisionTable}
      >
        {comments?.length && (
          <div
            style={{
              padding: window.innerWidth > 1440 ? '24px 24px 18px 24px' : 16,
              borderTop: '1px solid #e9eef6',
            }}
          >
            <Input
              labelText={t('noteForTheEntireLoadingList')}
              thinLabel
              multiLineAsInput
              multiline
              register={register}
              name="comment"
              style={{ minHeight: 90, maxHeight: 150 }}
              errors={errors.comment?.message}
            />
          </div>
        )}
      </Table>
    </Modal>
  );
});
