"use client";

import { Button } from "@atoms";

interface DeleteButtonProps {
  onClick: () => void;
  label?: string;
}

const DeleteButton = ({ onClick, label = "Eliminare" }: DeleteButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    className="w-full justify-center gap-2 text-red-500 border-red-200 hover:border-red-400 hover:bg-red-50 transition-colors"
    onClick={onClick}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8L12.667 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {label}
  </Button>
);

export { DeleteButton };
