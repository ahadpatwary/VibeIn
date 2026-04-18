"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  // Account
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  // Personal
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  gender: string;
  // Address
  country: string;
  city: string;
  address: string;
  // Extra
  bio: string;
  avatar: File | null;
  newsletter: boolean;
  terms: boolean;
};

const COUNTRIES = [
  "Bangladesh", "India", "Pakistan", "USA", "UK",
  "Canada", "Australia", "Germany", "France", "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    email: "", username: "", password: "", confirmPassword: "",
    firstName: "", lastName: "", phone: "", dob: "", gender: "",
    country: "", city: "", address: "",
    bio: "", avatar: null, newsletter: false, terms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormData, val: string | boolean | File | null) =>
    setForm((p) => ({ ...p, [key]: val }));

  const clearErr = (key: keyof FormData) =>
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  function passwordStrength(pw: string) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const map = [
      { label: "", color: "bg-gray-200", w: "0%" },
      { label: "Weak", color: "bg-red-400", w: "25%" },
      { label: "Fair", color: "bg-amber-400", w: "50%" },
      { label: "Good", color: "bg-yellow-400", w: "75%" },
      { label: "Strong", color: "bg-emerald-500", w: "100%" },
    ];
    return map[s];
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("avatar", file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.username.trim()) e.username = "Required";
    else if (!/^[a-z0-9_]{3,}$/.test(form.username)) e.username = "Min 3 chars, lowercase & numbers only";
    if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.country) e.country = "Select a country";
    if (!form.terms) e.terms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // if (!validate()) return;
    console.log("data", form);
    setLoading(true);
    // Replace this with your actual API call:
    // await fetch("/api/register", { method: "POST", body: JSON.stringify(form) });
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/dashboard");
  }

  const strength = passwordStrength(form.password);

  const initials = [form.firstName[0], form.lastName[0]]
    .filter(Boolean).join("").toUpperCase() || "?";

  return (
    <div className="min-h-dvh min-w-[310px] bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Info</h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Fill in your details below to get started {" "}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section: Personal Info ── */}
          <Section title="Personal information" subtitle="Your basic identity details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" error={errors.firstName} required>
                <input
                  type="text" placeholder="Arif"
                  value={form.firstName}
                  onChange={(e) => { set("firstName", e.target.value); clearErr("firstName"); }}
                  className={input(errors.firstName)}
                />
              </Field>
              <Field label="Last name" error={errors.lastName} required>
                <input
                  type="text" placeholder="Rahman"
                  value={form.lastName}
                  onChange={(e) => { set("lastName", e.target.value); clearErr("lastName"); }}
                  className={input(errors.lastName)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of birth">
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  className={input()}
                />
              </Field>
              <Field label="Gender">
                <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={input()}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
              </Field>
            </div>

            <Field label="Phone number" error={errors.phone} required>
              <input
                type="tel" placeholder="+880 17XX XXX XXX"
                value={form.phone}
                onChange={(e) => { set("phone", e.target.value); clearErr("phone"); }}
                className={input(errors.phone)}
              />
            </Field>

            <Field label="Short bio">
              <textarea
                rows={3} placeholder="Tell us a little about yourself…"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                className={input() + " resize-none"}
              />
            </Field>
          </Section>

                    {/* ── Section: Profile Photo ── */}
          <Section title="Profile photo" subtitle="Optional — we'll use your initials if skipped">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 overflow-hidden shrink-0 border-2 border-indigo-200">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-300 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </label>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG or WebP · Max 2MB</p>
              </div>
            </div>
          </Section>

          {/* // education- section */}
            <Section title="Education" subtitle="Where did you study?">
            <div className="grid grid-cols-2 gap-4">
              <Field label="College" error={errors.country} required>
                <input
                    type='text' placeholder='college'
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={input(errors.country)}
                />
              </Field>

              <Field label="Degree">
                <input
                  type="text" placeholder="Degree"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={input()}
                />
              </Field>
        
            </div>

            <button type="button"
                onClick={() => {
                    // Handle additional skill entry
                    }}
                className="text-white hover:text-indigo-800 text-sm font-medium w-full rounded-2xl bg-indigo-600 py-2"
            >
                Add another education
            </button>

          </Section>

          {/* skill -> section */}

          <Section title="Skills" subtitle="What are your top skills?">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Skill 1">
                <input  
                    type="text" placeholder="e.g., JavaScript"
                    // value={form.skill1}
                    // onChange={(e) => set("skill1", e.target.value)}
                    className={input()}
                />
              </Field>
            </div>
                <button type="button"
                    onClick={() => {
                        // Handle additional skill entry
                        }}
                    className="text-white hover:text-indigo-800 text-sm font-medium w-full rounded-2xl bg-indigo-600 py-2"
                >
                    Add another skill
                </button>
          </Section>



          {/* ── Section: Address ── */}
          <Section title="Location" subtitle="Where are you based?">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Country" error={errors.country} required>
                <select
                  value={form.country}
                  onChange={(e) => { set("country", e.target.value); clearErr("country"); }}
                  className={input(errors.country)}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="City">
                <input
                  type="text" placeholder="Dhaka"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={input()}
                />
              </Field>
            </div>
            <Field label="Street address">
              <input
                type="text" placeholder="House 12, Road 5, Block B…"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={input()}
              />
            </Field>
          </Section>


          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-2xl py-3.5 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Submit
              </>
            ) : "Submit"}
          </button>
        </form>

      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-200">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, error, required, children }: {
  label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const input = (err?: string) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-white outline-none transition-all placeholder:text-slate-300
   ${err
     ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
     : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"}`;