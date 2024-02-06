import s from '../index.module.scss';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { uppercase } from '@/helpers';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon, SelectCustom } from '@/components';

export const PointCard = ErrorBoundaryHoc(
  ({
    clearErrors,
    insert,
    remove,
    errors,
    index,
    control,
    move,
    id,
    fields,
    mode,
    setPointsForDelete,
    isNew,
    point_id,
  }) => {
    const pointList = useSelector(state => state.point.pointList);
    const { t } = useTranslation();
    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
      accept: 'card',
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
      hover(item, monitor) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
        move(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });
    const [{ isDragging }, drag] = useDrag({
      type: 'card',
      item: () => {
        return { id, index };
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    const onAdd = index => {
      insert(index + 1, { point_id: null, ...(mode === 'edit' && { isNew: true }) });
      clearErrors();
    };

    const onRemove = index => {
      remove(index);
      clearErrors();
      if (!isNew && mode === 'edit') setPointsForDelete(state => [...state, point_id.value]);
    };

    return (
      <div data-handler-id={handlerId} ref={ref} style={{ opacity }}>
        <p className={s.fieldLabel}>
          {uppercase(t('point'))} #{index + 1}:
        </p>
        <div className={s.field}>
          <Icon iconId="drop" iconClass={s.dropBtn} />
          <SelectCustom
            options={pointList?.map(({ id, name }) => ({ label: name, value: id }))}
            placeholder={t('modalCreateClientPlaceholder')}
            control={control}
            name={`points.${index}.point_id`}
            error={errors.points?.[index]?.point_id?.message}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            isDisabled={mode === 'edit' && !isNew}
          />
          <Icon
            iconId="blue-plus"
            style={{ margin: '0 16px 0 20px' }}
            clickable
            onClick={() => onAdd(index)}
            color="#004BAB"
          />
          <Icon
            iconId="trash"
            color="#DF3B57"
            clickable
            onClick={() => onRemove(index)}
            disabled={fields.length <= 2}
          />
        </div>
      </div>
    );
  }
);
