import s from './box.module.scss';
import React, { forwardRef } from 'react';
import clsx from 'clsx';

export const Box = forwardRef(({ children, className, ...rest }, ref) => {
  return (
    <div className={clsx(s.wrapper, 'boxRoot', className)} ref={ref} {...rest}>
      {children}
    </div>
  );
});
