"use client";

import { Footer, Header } from "@organisms";
import type { ChildrenType } from "@types";

interface MainTemplateProps extends ChildrenType {
  hideFooter?: boolean;
}

const MainTemplate = ({ children, hideFooter = false }: MainTemplateProps) => {
  return (
    <>
      <Header />
      {children}
      {!hideFooter && <Footer />}
    </>
  );
};

export { MainTemplate };
