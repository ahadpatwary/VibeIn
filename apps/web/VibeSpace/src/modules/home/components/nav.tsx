"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={[
          "fixed top-0 inset-x-0 z-50 h-16",
          "bg-neutral-900 backdrop-blur-xl",
          "border-b border-slate-800",
          "transition-shadow duration-300",
          scrolled ? "shadow-[0_2px_25px_rgba(0,0,0,0.6)]" : "",
        ].join(" ")}
      >
        <nav className="max-w-7xl mx-auto h-full px-5 sm:px-8 lg:px-12 flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mr-auto group shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-violet-600 text-white shadow-md group-hover:bg-violet-500 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 5l5-3 5 3v6l-5 3-5-3V5z" stroke="white" strokeWidth="1.4" />
                <circle cx="8" cy="8" r="1.5" fill="white" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-100">
              Code<span className="text-violet-400">Store</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="px-3.5 py-2 rounded-lg text-sm text-slate-300 font-medium hover:text-white hover:bg-slate-800 transition"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CLI badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <code className="text-[11px] text-slate-400 font-mono">
              npm i -g codestore-cli
            </code>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-500 transition shadow-md"
            >
              Sign up free
            </Link>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-800 transition gap-[5px]"
          >
            <span className={`h-0.5 w-5 bg-slate-200 transition ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-slate-200 transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-slate-200 transition ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-40 md:hidden transition ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 transition ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />

        {/* drawer */}
        <div
          className={`absolute top-16 inset-x-0 bg-slate-950 border-b border-slate-800 shadow-2xl transition-transform duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="px-5 py-6 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                {label}
              </Link>
            ))}

            {/* CLI */}
            <div className="mt-3 mx-1 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <code className="text-xs text-slate-400 font-mono">
                npm install -g codestore-cli
              </code>
            </div>

            {/* auth */}
            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-800">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center py-3 text-sm font-medium text-slate-300 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-center py-3 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-500 transition"
              >
                Sign up free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}