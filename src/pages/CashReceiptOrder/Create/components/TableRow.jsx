import s from '@components/Table/index.module.scss';
import React from 'react';
import { Checkbox } from '@components';

export const TableRow = () => {
  return (
    <tr>
      <td>
        <Checkbox size="big" variant="fill" checked />
      </td>
      <td className={s.text}>12.01.2022</td>
      <td className={s.text}>#555</td>
      <td className={s.text}>
        <p>TS-25022</p>
        <p style={{ color: '#828282' }}>Сергей Сергеев</p>
      </td>
      <td>
        <div className={s.tags}>
          <p>#555</p>
          <p>#555</p>
          <p>#555</p>
          <p>#555</p>
          <p>#555</p>
          <p>#555</p>
        </div>
      </td>
      <td className={s.text}>50</td>
      <td className={s.text}>50</td>
      <td className={s.text}>50</td>
      <td className={s.text}>5000 $</td>
      <td className={s.text}>1 000 $</td>
      <td className={s.text}>1 000 $</td>
    </tr>
  );
};
