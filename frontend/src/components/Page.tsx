// src/components/Page.tsx
import React from "react";

export const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-white text-slate-900">
    {children}
  </div>
);