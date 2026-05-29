'use client';

import { useState } from 'react';

import { AtomSelect } from '@atoms';

const options = [
  {
    label: 'Italiano',
    value: 'it',
  },
  {
    label: 'English',
    value: 'en',
  },
];

const LangSwitcher = () => {
  const [selected, setSelected] = useState(options[0]);

  return <AtomSelect options={options} value={selected} onChange={setSelected} variant="leng_switcher" />;
};

export { LangSwitcher };
