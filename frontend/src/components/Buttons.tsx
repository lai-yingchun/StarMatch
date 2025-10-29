// src/components/Buttons.tsx
import React from "react";

export const PrimaryButton = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 text-white rounded-full shadow hover:opacity-95 active:opacity-90 transition ${className}`}
    style={{ backgroundColor: "#2b6777" }}
  >
    <span className="text-xl font-semibold tracking-wide">{children}</span>
  </button>
);

export const GhostButton = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition ${className}`}
  >
    {children}
  </button>
);