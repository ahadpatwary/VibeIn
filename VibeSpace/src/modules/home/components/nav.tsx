// 'use client'

// import { Button } from "@/shared/components/ui/button"
// import { useRouter } from "next/navigation"

// function Nav() {
//     const router = useRouter()

//     return (
//         <nav className="w-full bg-background/90 backdrop-blur-sm border sticky top-0 z-30  ">
//             <div className="w-full sticky top-0 flex justify-between items-center px-6 py-4 bg-[#242427] border-b border-white/10">
//                 <p className="text-3xl font-semibold text-blue-400">VibeIn</p>

//                 <div className="flex items-center gap-6 text-sm text-gray-300">
//                     <span className="cursor-pointer hover:text-white hidden sm:block">Home</span>
//                     <span className="cursor-pointer hover:text-white hidden sm:block">About</span>
//                     <span className="cursor-pointer hover:text-white hidden sm:block">Support</span>
//                     <Button 
//                         className="cursor-pointer" 
//                         onClick={() => { router.push('/login')}}
//                     >
//                         Login
//                     </Button>
//                 </div>
//             </div>
//         </nav>

//     )
// }

// export default Nav

// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";

// const NAV_LINKS = [
//   { label: "Explore", href: "/explore" },
//   { label: "Marketplace", href: "/marketplace" },
//   { label: "Docs", href: "/docs" },
//   { label: "Pricing", href: "/pricing" },
// ];

// export default function Navbar() {
//   const [scrolled, setScrolled] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 12);
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   // lock body scroll when mobile menu is open
//   useEffect(() => {
//     document.body.style.overflow = menuOpen ? "hidden" : "";
//     return () => { document.body.style.overflow = ""; };
//   }, [menuOpen]);

//   return (
//     <>
//       <header
//         className={[
//           "fixed top-0 inset-x-0 z-50 h-16",
//           "bg-white/80 backdrop-blur-xl",
//           "border-b border-slate-100",
//           "transition-shadow duration-300",
//           scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.06)]" : "",
//         ].join(" ")}
//       >
//         <nav className="max-w-7xl mx-auto h-full px-5 sm:px-8 lg:px-12 flex items-center gap-6">

//           {/* ── Logo ── */}
//           <Link href="/" className="flex items-center gap-2.5 mr-auto group shrink-0">
//             <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-violet-600 text-white shadow-sm group-hover:bg-violet-700 transition-colors duration-200">
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
//                 <path d="M3 5l5-3 5 3v6l-5 3-5-3V5z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
//                 <circle cx="8" cy="8" r="1.5" fill="white"/>
//               </svg>
//             </span>
//             <span className="text-[15px] font-semibold tracking-tight text-slate-900">
//               Code<span className="text-violet-600">Store</span>
//             </span>
//           </Link>

//           {/* ── Desktop nav links ── */}
//           <ul className="hidden md:flex items-center gap-1">
//             {NAV_LINKS.map(({ label, href }) => (
//               <li key={label}>
//                 <Link
//                   href={href}
//                   className="px-3.5 py-2 rounded-lg text-sm text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150 block"
//                 >
//                   {label}
//                 </Link>
//               </li>
//             ))}
//           </ul>

//           {/* ── Desktop CLI badge ── */}
//           <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
//             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
//             <code className="text-[11px] text-slate-500 font-mono tracking-tight whitespace-nowrap">
//               npm i -g codestore-cli
//             </code>
//           </div>

//           {/* ── Desktop actions ── */}
//           <div className="hidden md:flex items-center gap-2.5">
//             <Link
//               href="/login"
//               className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
//             >
//               Log in
//             </Link>
//             <Link
//               href="/signup"
//               className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors duration-150 shadow-sm hover:shadow-md"
//             >
//               Sign up free
//             </Link>
//           </div>

//           {/* ── Mobile hamburger ── */}
//           <button
//             onClick={() => setMenuOpen((o) => !o)}
//             aria-label={menuOpen ? "Close menu" : "Open menu"}
//             aria-expanded={menuOpen}
//             className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors gap-[5px]"
//           >
//             <span
//               className={[
//                 "block h-0.5 w-5 bg-slate-700 rounded-full origin-center transition-transform duration-300",
//                 menuOpen ? "translate-y-[7px] rotate-45" : "",
//               ].join(" ")}
//             />
//             <span
//               className={[
//                 "block h-0.5 w-5 bg-slate-700 rounded-full transition-opacity duration-200",
//                 menuOpen ? "opacity-0" : "",
//               ].join(" ")}
//             />
//             <span
//               className={[
//                 "block h-0.5 w-5 bg-slate-700 rounded-full origin-center transition-transform duration-300",
//                 menuOpen ? "-translate-y-[7px] -rotate-45" : "",
//               ].join(" ")}
//             />
//           </button>
//         </nav>
//       </header>

//       {/* ── Mobile menu overlay ── */}
//       <div
//         aria-hidden={!menuOpen}
//         className={[
//           "fixed inset-0 z-40 md:hidden transition-all duration-300",
//           menuOpen ? "pointer-events-auto" : "pointer-events-none",
//         ].join(" ")}
//       >
//         {/* backdrop */}
//         <div
//           onClick={() => setMenuOpen(false)}
//           className={[
//             "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
//             menuOpen ? "opacity-100" : "opacity-0",
//           ].join(" ")}
//         />

//         {/* drawer */}
//         <div
//           className={[
//             "absolute top-16 inset-x-0 bg-white border-b border-slate-100 shadow-xl",
//             "transition-transform duration-300 ease-out",
//             menuOpen ? "translate-y-0" : "-translate-y-4 opacity-0",
//           ].join(" ")}
//         >
//           <div className="px-5 py-6 flex flex-col gap-1">
//             {NAV_LINKS.map(({ label, href }) => (
//               <Link
//                 key={label}
//                 href={href}
//                 onClick={() => setMenuOpen(false)}
//                 className="px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
//               >
//                 {label}
//               </Link>
//             ))}

//             {/* CLI hint in mobile */}
//             <div className="mt-3 mx-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
//               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
//               <code className="text-xs text-slate-500 font-mono">
//                 npm install -g codestore-cli
//               </code>
//             </div>

//             {/* auth buttons */}
//             <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-100">
//               <Link
//                 href="/login"
//                 onClick={() => setMenuOpen(false)}
//                 className="text-center py-3 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
//               >
//                 Log in
//               </Link>
//               <Link
//                 href="/signup"
//                 onClick={() => setMenuOpen(false)}
//                 className="text-center py-3 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors shadow-sm"
//               >
//                 Sign up free →
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

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
          "bg-slate-950/70 backdrop-blur-xl",
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
              href="/signup"
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