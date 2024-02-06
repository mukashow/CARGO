import React from 'react';
import s from './index.module.scss';
import clsx from 'clsx';
import { ColorRing } from 'react-loader-spinner';

export const Loader = ({ size = 'default' }) => {
  return (
    <div className={clsx(s.root, size === 'small' && s.small)}>
      <ColorRing
        visible={true}
        height="100"
        width="100"
        ariaLabel="blocks-loading"
        wrapperClass="blocks-wrapper"
        colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
      />
    </div>
  );
};
