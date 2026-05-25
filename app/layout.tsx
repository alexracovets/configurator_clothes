import type { ChildrenType } from "@types";
import { inter, oswald, bebasNeue, anton, russoOne, blackOpsOne } from "@fonts";

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
        oswald.variable,
        bebasNeue.variable,
        anton.variable,
        russoOne.variable,
        blackOpsOne.variable,
      )}
    >
      <body className="h-full">{children}</body>
    </html>
  );
};

export default RootLayout;
