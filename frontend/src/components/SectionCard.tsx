// src/components/SectionCard.tsx
import React from "react";

export type SectionCardProps = {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  right,
  children,
  className = "",
}) => (
  <div
    className={`
      bg-rose-50/40
      border border-rose-100
      rounded-2xl
      p-5
      shadow-sm
      ${className}
    `}
  >
    {(title || right) && (
      <div className="flex items-center justify-between mb-3">
        {title ? (
          <h2 className="text-2xl font-semibold text-slate-800 tracking-wide">
            {title}
          </h2>
        ) : (
          <div />
        )}
        {right}
      </div>
    )}
    {children}
  </div>
);