'use client';

import { cn } from '@utils';
import type { ChildrenType } from '@types';

interface ContainerProps extends ChildrenType {
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => {
  return <div className={cn('w-full max-w-[1440px] px-12 mx-auto', className)}>{children}</div>;
};

export { Container };
