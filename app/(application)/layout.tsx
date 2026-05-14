import { Footer, Header } from "@organisms";

import type { ChildrenType } from "@types";

const FrontEndLayout = ({ children }: ChildrenType) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
};

export default FrontEndLayout;
