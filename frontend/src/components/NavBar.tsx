// src/components/NavBar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const NavBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const NavLinkBtn = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={`
        relative px-4 py-2 text-sm font-semibold tracking-wide transition
        ${isActive(to) ? "text-[#1e4a57]" : "text-slate-900 hover:text-[#1e4a57]"}
      `}
    >
      {label}
      <span
        className={`
          absolute left-1/2 -bottom-1 -translate-x-1/2
          h-[3px] rounded-full transition-all
          ${isActive(to) ? "w-6 bg-[#1e4a57]" : "w-0 bg-transparent"}
        `}
      />
    </Link>
  );

  return (
    <header
      className="
        sticky top-0 z-40
        backdrop-blur-md
        bg-[#f7d9dc]
        border-b border-[#f1c9cc]
        shadow-[0_4px_10px_rgba(0,0,0,0.05)]
      "
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-tight group">
          <span
            className="
              font-black tracking-wider text-lg text-[#0f172a]
              group-hover:text-[#1e4a57] transition-colors
            "
          >
            STARMATCH
          </span>

          <span
            className="
              text-[11px] font-medium tracking-[0.08em]
              text-[#1e293b]
              group-hover:text-[#1e4a57]/80 transition-colors
            "
          >
            BRAND × CELEBRITY
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLinkBtn to="/" label="HOME" />
          <NavLinkBtn to="/recommend" label="RECOMMENDATION" />
          <NavLinkBtn to="/analysis" label="ANALYSIS" />
          <NavLinkBtn to="/news" label="NEWS" />
        </nav>

        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg border border-slate-400/40 hover:bg-white/40 transition"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="w-5 h-0.5 bg-slate-800 mb-1 rounded" />
          <div className="w-5 h-0.5 bg-slate-800 mb-1 rounded" />
          <div className="w-5 h-0.5 bg-slate-800 rounded" />
        </button>
      </div>

      {open && (
        <div
          className="
            md:hidden flex flex-col gap-2 px-4 pb-4
            bg-[rgba(255,232,235,0.7)]/80
            backdrop-blur-xl
            border-t border-rose-200/70
          "
        >
          {["HOME", "RECOMMEND", "ANALYSIS", "NEWS"].map((label, i) => {
            const path = label === "HOME" ? "/" : `/${label.toLowerCase()}`;
            return (
              <Link
                key={i}
                to={path}
                className="py-2 text-slate-900 font-semibold tracking-wide"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};