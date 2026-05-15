"use client";

import Link from "next/link";
import { AtomImage, Flex } from "@atoms";

const Logo = () => {
  return (
    <Flex className="w-full">
      <Link href="/">
        <AtomImage src="./png/logo.png" alt="Logo" width={170} height={38} />
      </Link>
    </Flex>
  );
};

export { Logo };
