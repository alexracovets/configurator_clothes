"use client";

const MenuStepSeparator = ({ isActive }: { isActive?: boolean }) => {
  return (
    <span
      className={`block w-3 h-0.5 shrink-0 transition-opacity ${isActive ? "bg-gray-10 opacity-100" : "bg-gray-10 opacity-30"}`}
    />
  );
};

export { MenuStepSeparator };
