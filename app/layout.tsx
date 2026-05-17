import type { ChildrenType } from "@types";
import { inter } from "@fonts";

import "@styles/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/src/utils/cn/cn";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const RootLayout = ({ children }: ChildrenType) => {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "bg-white",
        inter.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="grid grid-cols-1 grid-rows-[auto_1fr_auto] min-h-screen">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
