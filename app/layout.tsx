import type { ChildrenType } from "@types";
import { inter } from "@fonts";

import "@styles/globals.css";

const RootLayout = ({ children }: ChildrenType) => {
  return (
    <html lang="en" className={`h-full antialiased bg-background ${inter.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
};

export default RootLayout;
