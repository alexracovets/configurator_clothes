"use client";

import { Footer, Header } from "@organisms";
import type { ChildrenType } from "@types";

const MainTemplate = ({ children }: ChildrenType) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export { MainTemplate };
