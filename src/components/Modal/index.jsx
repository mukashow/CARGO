import s from './index.module.scss';
import React from 'react';
import ReactModal from 'react-modal';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Button, Icon } from '@/components';
import './index.css';

export const Modal = ErrorBoundaryHoc(
  ({
    children,
    isOpen,
    close,
    title,
    contentStyle,
    outsideCloseBtn,
    overflow = 'auto',
    ...props
  }) => {
    return (
      <ReactModal
        isOpen={isOpen}
        ariaHideApp={false}
        onRequestClose={close}
        closeTimeoutMS={200}
        style={{
          overlay: {
            background: 'rgba(0, 0, 0, .5)',
            zIndex: 1000,
          },
          content: {
            position: 'relative',
            inset: 'auto',
            border: 'none',
            padding: window.innerWidth > 1440 ? '24px 30px 40px' : '24px',
            overflow,
            ...contentStyle,
          },
        }}
        {...props}
      >
        <Icon
          iconId="cross"
          iconClass={clsx(s.closeIcon, outsideCloseBtn && s.outside)}
          color={outsideCloseBtn ? 'white' : '#828282'}
          onClick={close}
          clickable
        />
        {title && (
          <Button
            value={title}
            isStaticTitle
            style={{
              marginBottom: window.innerWidth > 1440 ? 24 : 10,
              display: 'inline-flex',
              maxWidth: 290,
            }}
          />
        )}
        {children}
      </ReactModal>
    );
  }
);
