"use client";

import type { ChildrenType } from "@types";
import { cn } from "@utils";

interface ContainerProps extends ChildrenType {
    className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
    return (
        <div className={cn(
            "w-full max-w-[1344px] mx-auto",
            className)}
        >
            {children}
        </div>
    )
}