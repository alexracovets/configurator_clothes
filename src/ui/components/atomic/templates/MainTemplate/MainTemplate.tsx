"use client";

import { Footer, Header } from "@organisms";
import type { ChildrenType } from "@types";

const MainTemplate = ({ children }: ChildrenType) => {
  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr_auto] h-full">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export { MainTemplate };
