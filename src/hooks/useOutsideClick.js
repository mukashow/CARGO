import { useEffect } from 'react';

export const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const listener = event => {
      if (Array.isArray(ref)) {
        const refs = ref.filter(item => {
          if (item) return !!item?.current || !!item;
          return false;
        });
        const isClickOnEl = refs.some(item => {
          if (item.current) return item.current?.contains(event.target);
          return item.contains?.(event.target);
        });
        if (isClickOnEl) return;
        handler(event);
        return;
      }
      if (!ref.current || ref.current?.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mouseup', listener);

    return () => {
      document.removeEventListener('mouseup', listener);
    };
  }, [ref, handler]);
};
