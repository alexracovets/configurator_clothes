import { ConfiguratorTemplate } from '@templates';
import type { ChildrenType } from '@types';

const ConfiguratorLayout = ({ children }: ChildrenType) => {
  return <ConfiguratorTemplate>{children}</ConfiguratorTemplate>;
};

export default ConfiguratorLayout;
