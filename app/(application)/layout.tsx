import { headers } from "next/headers";

import { MainTemplate } from "@templates";
import type { ChildrenType } from "@types";

const FrontEndLayout = async ({ children }: ChildrenType) => {
  const headersList = await headers();
  const hideFooter = headersList.get("x-hide-footer") === "true";

  return <MainTemplate hideFooter={hideFooter}>{children}</MainTemplate>;
};

export default FrontEndLayout;
