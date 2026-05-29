'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AtomImage, Flex } from '@atoms';

const Logo = () => {
  const pathname = usePathname();
  const href = pathname === '/configurator' ? '/' : '/configurator';

  return (
    <Flex className="w-full">
      <Link href={href}>
        <AtomImage src="./png/logo.png" alt="Logo" width={170} height={38} />
      </Link>
    </Flex>
  );
};

export { Logo };
