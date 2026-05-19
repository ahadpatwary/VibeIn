// 'use client'
// import { Button } from '@/shared/components/ui/button'
// import { Card } from '@/shared/components/ui/card'
// import { useRouter } from 'next/navigation'
// import homePageCardData  from '../../../data/HomePageCardData.json'


// function Main() {
//     const router = useRouter()

//   return (
//     <main className="flex-1 max-w-7xl min-w-[310px] w-full mx-auto px-4">

//         {/* HERO SECTION */}
//         <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 py-20">
          
//           <div className="max-w-xl text-center md:text-left">
//             <h1 className="text-4xl md:text-5xl font-bold leading-tight">
//               The Community <br/>
//               <span className="text-blue-400">Build, Share & Monetize Your Code</span>
//             </h1>

//             <p className="mt-4 text-gray-400">
//               Connect. Learn. Grow. <br/>
//               with developers worldwide.
//             </p>

//             <Button 
//               className="mt-6 px-6 py-3 text-lg shadow-lg cursor-pointer"
//               onClick={() => { router.push('/register')} }
//             >
//               Join VibeIn Today
//             </Button>
//           </div>

//           {/* Laptop Placeholder */}
//           <img src='./laptop.png' className="min-w-[310px] max-w-[500px] w-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-xl m-2"/>
//         </section>


//         {/* TAGLINE */}
//         <p className="text-center text-2xl md:text-3xl font-semibold my-16">
//           Empowering <span className="text-blue-400">Coders</span> to Succeed!
//         </p>

//         {/* FEATURE CARDS */}
//         <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {
//             homePageCardData.map((data) => (
//               <Card
//                 key={data.id}
//                 className="border border-white/10 rounded-xl p-6 hover:border-blue-500 transition"
//               >
//                 <p className="text-lg font-semibold text-blue-400 mb-2">
//                   {data.title}
//                 </p>
//                 <p className="text-sm text-gray-400">
//                   {data.description}
//                 </p>
//               </Card>
//             ))
//           }
//         </section>

//         {/* CTA SECTION */}
//         <section className="flex flex-col items-center text-center my-24 gap-4">
//           <h2 className="text-3xl font-bold">
//             Start Coding with <span className="text-blue-400">VibeIn</span> Today!
//           </h2>

//           <ul className="text-gray-400 space-y-2">
//             <li>✔ Build your network within the coding community</li>
//             <li>✔ Find your dream job in tech</li>
//             <li>✔ Stay up-to-date with latest tutorials</li>
//           </ul>

//           <Button 
//             className="mt-6 px-8 py-3 text-lg cursor-pointer"
//             onClick={() => { router.push('/register')} }
//           >
//             Join VibeIn
//           </Button>
//         </section>

//     </main>
//   )
// }

// export default Main



"use client";

import Link from "next/link";

/* ─── tiny reusable pieces ─────────────────────────────────── */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3.5 py-1.5 rounded-full">
      {children}
    </span>
  );
}

function StatPill({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{num}</span>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* subtle hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-50/40 via-transparent to-transparent pointer-events-none" />
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5 leading-snug">{title}</h3>
      <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function PostCard({
  gradient,
  tags,
  title,
  desc,
  author,
  price,
  free,
}: {
  gradient: string;
  tags: string[];
  title: string;
  desc: string;
  author: string;
  price?: string;
  free?: boolean;
}) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* thumb */}
      <div className={`h-36 flex items-center justify-center text-4xl select-none ${gradient}`} aria-hidden="true" />
      <div className="p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((t) => (
            <span key={t} className="text-[10px] font-semibold bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-100">
              {t}
            </span>
          ))}
        </div>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1.5">{title}</h3>
        <p className="text-[12px] text-slate-400 leading-relaxed mb-4">{desc}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center text-[9px] font-bold text-violet-700">
              {author.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">{author}</span>
          </div>
          {free ? (
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full">Free</span>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">৳ {price}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StepItem({
  n,
  title,
  desc,
  cmd,
}: {
  n: number;
  title: string;
  desc: string;
  cmd?: string;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center gap-0">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center shadow-md shadow-violet-200">
          {n}
        </div>
        {n < 4 && <div className="flex-1 w-px bg-slate-100 my-2 min-h-[40px]" />}
      </div>
      <div className="pb-8">
        <h3 className="text-[15px] font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-2">{desc}</p>
        {cmd && (
          <code className="inline-block text-xs font-mono bg-slate-50 border border-slate-100 text-violet-600 px-3 py-1.5 rounded-lg">
            {cmd}
          </code>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN EXPORT ───────────────────────────────────────────── */

export default function HeroSection() {
  return (
    <main className="pt-16">

      {/* ══ 1. HERO ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* soft radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-violet-100/50 blur-3xl"
        />
        {/* subtle grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(91,79,232,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(91,79,232,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            npm install -g codestore-cli
          </Badge>

          <h1 className="mt-8 text-[44px] sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[1.05] max-w-4xl mx-auto">
            Share, sell &amp;{" "}
            <span className="text-violet-600">discover code</span>
            {" "}— like a feed
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Push code from your terminal, publish as a rich post, sell in the marketplace,
            and sync with GitHub — all in one unified platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-7 py-3.5 rounded-xl shadow-md hover:shadow-violet-300 hover:shadow-xl transition-all duration-200"
            >
              Get started free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm px-7 py-3.5 rounded-xl hover:bg-slate-50 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              Browse marketplace
            </Link>
          </div>

          {/* Terminal */}
          <div className="mt-14 mx-auto max-w-lg bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800 text-left">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs text-slate-500 font-mono">~ Terminal</span>
            </div>
            <div className="px-5 py-5 font-mono text-[13px] space-y-2 leading-relaxed">
              {[
                { prompt: "$", cmd: "npm install -g codestore-cli", out: null },
                { prompt: "$", cmd: "cs login", out: null },
                { prompt: "$", cmd: 'cs commit -m "feat: add auth module"', out: null },
                { prompt: "$", cmd: "cs push --publish", out: null },
                { prompt: null, cmd: null, out: "✓ Published to CodeStore! 🎉" },
              ].map((l, i) => (
                <div key={i} className="flex gap-2">
                  {l.prompt && <span className="text-slate-500 select-none">{l.prompt}</span>}
                  {l.cmd && <span className="text-violet-300">{l.cmd}</span>}
                  {l.out && <span className="text-emerald-400">{l.out}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
            <StatPill num="24k+" label="Packages published" />
            <div className="hidden sm:block h-8 w-px bg-slate-100" aria-hidden="true" />
            <StatPill num="8.3k" label="Developers" />
            <div className="hidden sm:block h-8 w-px bg-slate-100" aria-hidden="true" />
            <StatPill num="$142k" label="Earned by creators" />
          </div>
        </div>
      </section>

      {/* ══ 2. FEATURES ══════════════════════════════════════════ */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything your code needs
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              From CLI push to marketplace sale — one unified platform built for developers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<span className="text-violet-600 text-xl">⌨️</span>}
              accent="bg-violet-50"
              title="CLI-first workflow"
              desc="Install via npm and push code, branches, and commits directly from your terminal. Git-like commands, zero learning curve."
            />
            <FeatureCard
              icon={<span className="text-emerald-600 text-xl">📰</span>}
              accent="bg-emerald-50"
              title="Feed posts"
              desc="Publish your package as a rich post with title, description, demo video, and screenshots — visible to the whole community."
            />
            <FeatureCard
              icon={<span className="text-amber-600 text-xl">💰</span>}
              accent="bg-amber-50"
              title="Sell your code"
              desc="Set a price, accept payments, and let buyers purchase and instantly clone your package to VS Code with one click."
            />
            <FeatureCard
              icon={<span className="text-blue-600 text-xl">🔔</span>}
              accent="bg-blue-50"
              title="Smart notifications"
              desc="Every buyer is automatically notified on new commits and updates. Keep your users always on the latest version."
            />
            <FeatureCard
              icon={<span className="text-slate-700 text-xl">🐙</span>}
              accent="bg-slate-100"
              title="GitHub two-way sync"
              desc="Connect your GitHub repo. Changes on GitHub reflect here, and pushes here reflect on GitHub — always in sync."
            />
            <FeatureCard
              icon={<span className="text-rose-600 text-xl">🔒</span>}
              accent="bg-rose-50"
              title="Secure auth"
              desc="OAuth login, role-based access, token-protected CLI sessions, and private repos baked in from day one."
            />
          </div>
        </div>
      </section>

      {/* ══ 3. MARKETPLACE FEED PREVIEW ══════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Marketplace</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Discover community code
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="shrink-0 text-sm font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <PostCard
              gradient="bg-gradient-to-br from-violet-100 to-violet-200"
              tags={["React", "Charts"]}
              title="Animated chart library with 12 types"
              desc="Lightweight zero-dependency chart components for React with smooth animations and TypeScript support."
              author="r.khan"
              price="350"
            />
            <PostCard
              gradient="bg-gradient-to-br from-emerald-100 to-teal-200"
              tags={["Node.js", "API"]}
              title="REST API boilerplate with auth & rate limiting"
              desc="Production-ready Express starter with JWT auth, Redis rate limiting, and structured logging."
              author="t.hasan"
              free
            />
            <PostCard
              gradient="bg-gradient-to-br from-blue-100 to-indigo-200"
              tags={["Flutter", "UI Kit"]}
              title="Flutter dashboard UI kit — 40+ screens"
              desc="Complete admin dashboard for Flutter with dark mode, responsive layout, and Figma source included."
              author="s.ahmed"
              price="890"
            />
          </div>
        </div>
      </section>

      {/* ══ 4. HOW IT WORKS ══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">How it works</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                From terminal to marketplace in minutes
              </h2>
              <p className="mt-4 text-slate-400 text-base max-w-md">
                Four simple steps. No friction. No complicated setup.
              </p>
            </div>
            <div className="mt-2">
              <StepItem n={1} title="Install the CLI" desc="Get the CodeStore CLI from npm in seconds." cmd="npm install -g codestore-cli" />
              <StepItem n={2} title="Push your code" desc="Use familiar Git-like commands to commit and push." cmd="cs commit -m 'v1.0' && cs push" />
              <StepItem n={3} title="Publish a post" desc="Add a title, description, demo image, and go live on the feed." />
              <StepItem n={4} title="Earn & keep updating" desc="Set your price, accept payments, push updates — buyers get notified automatically." />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 5. GITHUB SYNC + NOTIFICATIONS ══════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* notifications mockup */}
            <div>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Notifications</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Buyers always stay updated
              </h2>
              <p className="mt-4 text-slate-400 text-base max-w-md">
                Every commit you push triggers instant notifications to all your buyers. No manual changelogs needed.
              </p>

              <div className="mt-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
                {[
                  { color: "bg-violet-500", text: "chart-lib released v1.4.0 — 3 new chart types added.", time: "2m ago" },
                  { color: "bg-emerald-500", text: "Your purchase of api-boilerplate is ready to clone in VS Code.", time: "1h ago" },
                  { color: "bg-amber-400", text: "GitHub sync detected 2 new commits in your connected repo.", time: "3h ago" },
                ].map(({ color, text, time }, i) => (
                  <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                    <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-700 leading-snug">{text}</p>
                    </div>
                    <span className="text-[11px] text-slate-300 flex-shrink-0 mt-0.5">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* github sync mockup */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">GitHub Sync</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Two-way GitHub sync
              </h2>
              <p className="mt-4 text-slate-400 text-base max-w-md">
                Connect your GitHub repo and both stay in sync automatically. Push anywhere — it reflects everywhere.
              </p>

              <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">🐙</div>
                    <div className="text-xs font-semibold text-slate-700">GitHub repo</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">main branch</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-slate-300 text-lg">⇄</div>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Live sync</span>
                  </div>
                  <div className="flex-1 bg-white border border-violet-200 rounded-xl p-4 text-center">
                    <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center mx-auto mb-1">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 5l5-3 5 3v6l-5 3-5-3V5z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
                        <circle cx="8" cy="8" r="1.5" fill="white"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-slate-700">CodeStore</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">your package</div>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <p className="text-xs text-slate-500 font-mono">2 commits synced · last updated just now</p>
                </div>
              </div>

              <div className="mt-4 bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-lg">💻</div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">One-click VS Code clone</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">After purchase, buyers open the package in VS Code instantly — no manual git clone needed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. CTA BANNER ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-violet-600 py-20 sm:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"
        />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            🚀 Join 8,300+ developers
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to publish your first package?
          </h2>
          <p className="mt-5 text-violet-200 text-base sm:text-lg max-w-xl mx-auto">
            Install the CLI, push your code, and go live on the feed in under 5 minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Get started — it&apos;s free
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Read the docs →
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}