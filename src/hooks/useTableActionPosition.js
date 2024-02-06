import { useState } from 'react';
import { usePopper } from 'react-popper';

export const useTableActionPosition = isSmallTable => {
  const [actionOpenerRef, setActionOpenerRef] = useState(null);
  const [dropdownRef, setDropdownRef] = useState(null);

  const { styles, attributes } = usePopper(actionOpenerRef, dropdownRef, {
    placement: 'right-start',
    modifiers: {
      name: 'offset',
      options: {
        offset: actionOpenerRef
          ? [
              actionOpenerRef.clientHeight - (isSmallTable ? 5 : 10),
              -Math.abs(actionOpenerRef.clientWidth + (isSmallTable ? 16 : 24)),
            ]
          : [0, 0],
      },
    },
  });

  return [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes];
};
