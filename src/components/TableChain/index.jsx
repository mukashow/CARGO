import s from './index.module.scss';
import React, { useRef, useState } from 'react';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon } from '@/components';
import { useOutsideClick } from '@/hooks';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const TableChain = ErrorBoundaryHoc(({ chain }) => {
  const [detailChainOpen, setDetailChainOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setDetailChainOpen(false));

  return (
    <div className={s.root}>
      {chain.length > 3 ? (
        <>
          <Chain {...chain[0]} index={0} chain={chain} />
          <div ref={ref}>
            <div
              className={s.dots}
              onClick={e => {
                e.stopPropagation();
                setDetailChainOpen(!detailChainOpen);
              }}
            >
              ...
            </div>
            {detailChainOpen && (
              <div className={s.chainDetail}>
                <div className={s.root}>
                  {chain.map((item, index) => (
                    <Chain key={item.title} {...item} index={index} chain={chain} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <Icon iconId="arrow-right-thin" iconWidth={15} iconHeight={15} />
          <Chain {...chain.at(-1)} index={chain.length - 1} chain={chain} />
        </>
      ) : (
        chain.map((item, index) => <Chain key={item.title} {...item} index={index} chain={chain} />)
      )}
    </div>
  );
});

const Chain = ErrorBoundaryHoc(({ title, index, chain }) => {
  return (
    <div className={s.chain}>
      <div
        className={s.mark}
        style={
          index === chain.length - 2 && index !== 1 && index !== 2 ? { background: '#df3b57' } : {}
        }
      >
        {ALPHABET[index]}
      </div>
      <span className={s.chainTitle} title={title}>
        {title}
      </span>
      {index !== chain.length - 1 && (
        <Icon iconId="arrow-right-thin" iconWidth={15} iconHeight={15} />
      )}
    </div>
  );
});
