import { MainTemplate } from "@templates";

import type { ChildrenType } from "@types";

const FrontEndLayout = async ({ children }: ChildrenType) => {
  return <MainTemplate>{children}</MainTemplate>;
};

export default FrontEndLayout;
