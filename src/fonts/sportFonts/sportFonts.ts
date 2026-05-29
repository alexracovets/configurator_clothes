import { Anton, Bebas_Neue, Black_Ops_One, Oswald, Russo_One } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-oswald',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
});

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
});

const russoOne = Russo_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-russo-one',
});

const blackOpsOne = Black_Ops_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-black-ops-one',
});

export { anton, bebasNeue, blackOpsOne, oswald, russoOne };
