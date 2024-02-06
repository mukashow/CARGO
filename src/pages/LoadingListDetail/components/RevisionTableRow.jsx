import s from '@components/Table/index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Checkbox, Input } from '@/components';

export const RevisionTableRow = ErrorBoundaryHoc(
  ({
    item: {
      receiver,
      receiver_code,
      goods_type_name,
      tnved,
      tnved_code,
      tnved_name,
      place_count,
      weight,
      volume,
      checked,
      comment,
      tags,
    },
    register,
    update,
    trigger,
    errors,
    index,
  }) => {
    const { t } = useTranslation();

    return (
      <>
        <tr>
          <td>
            <Checkbox
              size="big"
              containerStyle={{ position: 'relative', zIndex: 2 }}
              checked={!!checked}
              onChange={() => {
                update(index, {
                  receiver,
                  receiver_code,
                  goods_type_name,
                  tnved_code: tnved?.code || tnved_code,
                  tnved: tnved?.id || tnved,
                  tnved_name: tnved?.name || tnved_name,
                  place_count,
                  weight,
                  volume,
                  comment,
                  tags,
                  checked: !checked,
                });
                if (checked) trigger('comment');
              }}
            />
          </td>
          <td>
            <span className={s.text}>{receiver_code}</span>
          </td>
          <td>
            <span className={s.text}>{goods_type_name}</span>
          </td>
          <td>
            <p className={s.text}>{tnved?.code || tnved_code}</p>
            <p className={s.text} style={{ color: '#828282' }}>
              {tnved?.name || tnved_name}
            </p>
          </td>
          <td>
            <span className={s.text}>{place_count}</span>
          </td>
          <td>
            <span className={s.text}>
              {weight} {t('weightKg')}
            </span>
          </td>
          <td>
            <span className={s.text}>
              {volume} {t('cubicMeter')}
            </span>
          </td>
          <td style={{ minWidth: 150, width: 440 }}>
            <Input
              multiline
              rows={1}
              multiLineAsInput
              register={register}
              name={`comments.${index}.comment`}
              style={{ maxHeight: 100, minHeight: 34 }}
              onChange={() => trigger('comment')}
              errors={errors[`comments[${index}].comment`]?.message}
            />
          </td>
        </tr>
      </>
    );
  }
);
