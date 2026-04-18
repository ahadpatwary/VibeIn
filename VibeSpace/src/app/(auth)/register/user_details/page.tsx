"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// ── Zod Schema ────────────────────────────────────────────────

const educationSchema = z.object({
  college: z.string().min(3, "College name required"),
  degree: z.string().optional(),
});

const skillSchema = z.object({
  name: z.string().min(1, "Skill name required"),
});

const socialMediaSchema = z.object({
    account: z.string().min(3, "Account name required"),
    link: z.string().url("Valid URL required"),
})

const formSchema = z.object({
  // Personal
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Required"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().optional(),
  // Account
//   email: z.string().email("Valid email required"),
//   username: z
//     .string()
//     .min(3, "Min 3 characters")
//     .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers & underscores only"),
//   password: z.string().min(8, "At least 8 characters"),
//   confirmPassword: z.string(),
  // Address
  country: z.string().min(1, "Select a country"),
  city: z.string().optional(),
  address: z.string().optional(),
  // Extra
//   avatar: z.any().nullable().optional(),
//   newsletter: z.boolean().optional(),
//   terms: z.literal(true, {
//     errorMap: () => ({ message: "You must accept the terms" }),
//   }),
  // Dynamic
  educations: z.array(educationSchema).min(0),
  skills: z.array(skillSchema).min(0),
  socialMedias: z.array(socialMediaSchema).min(0)
});

// }).refine((d) => d.password === d.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"], 
// });

type FormData = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<string, string>>;

// ── Constants ─────────────────────────────────────────────────

const COUNTRIES = [
  "Bangladesh", "India", "Pakistan", "USA", "UK",
  "Canada", "Australia", "Germany", "France", "Other",
];

// ── Main Component ────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<Omit<FormData, "educations" | "skills" | "socialMedias"> & {
    educations: { college: string; degree: string }[];
    skills: { name: string }[];
    socialMedias: { account: string, link: string}[];
  }>({
    firstName: "", lastName: "", dob: "", gender: "", phone: "", email: "",
    country: "", city: "", address: "",
    bio: "",
    educations: [{ college: "", degree: "" }],
    skills: [{ name: "" }],
    socialMedias: [{ account: "", link: "" }],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Field helpers ──

  const set = (key: string, val: unknown) =>
    setForm((p) => ({ ...p, [key]: val }));

  const clearErr = (key: string) =>
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  // ── Education handlers ──

  const addEducation = () =>
    setForm((p) => ({ ...p, educations: [...p.educations, { college: "", degree: "" }] }));

  const removeEducation = (i: number) =>
    setForm((p) => ({ ...p, educations: p.educations.filter((_, idx) => idx !== i) }));

  const setEducation = (i: number, field: "college" | "degree", val: string) => {
    setForm((p) => {
      const updated = [...p.educations];
      updated[i] = { ...updated[i], [field]: val };
      return { ...p, educations: updated };
    });
    clearErr(`educations.${i}.${field}`);
  };

  // ── Skill handlers ──

  const addSkill = () =>
    setForm((p) => ({ ...p, skills: [...p.skills, { name: "" }] }));

  const removeSkill = (i: number) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));

  const setSkill = (i: number, val: string) => {
    setForm((p) => {
      const updated = [...p.skills];
      updated[i] = { name: val };
      return { ...p, skills: updated };
    });
    clearErr(`skills.${i}.name`);
  };

  const addSocialMedia = () =>
    setForm((p) => ({ ...p, socialMedias: [...p.socialMedias, { name: "" }] }));

  const removeSocialMedis = (i: number) =>
    setForm((p) => ({ ...p, socialMedias: p.socialMedias.filter((_, idx) => idx !== i) }));

  const setSocialMedia = (i: number, val: string) => {
    setForm((p) => {
      const updated = [...p.socialMedias];
      updated[i] = { name: val };
      return { ...p, socialMedial: updated };
    });
    clearErr(`socialMedias.${i}.name`);
  };

  // ── Avatar ──

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("avatar", file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ── Password strength ──

//   function passwordStrength(pw: string) {
//     let s = 0;
//     if (pw.length >= 8) s++;
//     if (/[A-Z]/.test(pw)) s++;
//     if (/[0-9]/.test(pw)) s++;
//     if (/[^A-Za-z0-9]/.test(pw)) s++;
//     return [
//       { label: "", color: "bg-slate-200", w: "0%" },
//       { label: "Weak", color: "bg-red-400", w: "25%" },
//       { label: "Fair", color: "bg-amber-400", w: "50%" },
//       { label: "Good", color: "bg-yellow-400", w: "75%" },
//       { label: "Strong", color: "bg-emerald-500", w: "100%" },
//     ][s];
//   }

  // ── Validation with Zod ──

  function validate(): boolean {
    const result = formSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }

    const errs: FormErrors = {};
    for (const issue of result.error.issues) {
      // e.g. path = ["educations", 0, "college"]  → key = "educations.0.college"
      const key = issue.path.join(".");
      if (!errs[key]) errs[key] = issue.message;
    }
    setErrors(errs);
    return false;
  }

  // ── Submit ──

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    console.log("Submitted:", form);
    // await fetch("/api/register", { method: "POST", body: JSON.stringify(form) });
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/dashboard");
  }

//   const strength = passwordStrength(form.password);
  const initials = [form.firstName[0], form.lastName[0]].filter(Boolean).join("").toUpperCase() || "?";

  return (
    <div className="min-h-dvh min-w-[310px] w-full bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight"> Account Info</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Fill in your details below to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Personal Info ── */}
          <Section title="Personal information" subtitle="Your basic identity details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" error={errors.firstName} required>
                <input type="text" placeholder="Arif"
                  value={form.firstName}
                  onChange={(e) => { set("firstName", e.target.value); clearErr("firstName"); }}
                  className={input(errors.firstName)} />
              </Field>
              <Field label="Last name" error={errors.lastName} required>
                <input type="text" placeholder="Rahman"
                  value={form.lastName}
                  onChange={(e) => { set("lastName", e.target.value); clearErr("lastName"); }}
                  className={input(errors.lastName)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of birth">
                <input type="date" value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  className={input()} />
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
            <Field label="Email" error={errors.email} required>
              <input type="email" placeholder="abdul@gmail.com"
                value={form.email}
                onChange={(e) => { set("email", e.target.value); clearErr("email"); }}
                className={input(errors.email)} />
            </Field>
            <Field label="Phone number" error={errors.phone} required>
              <input type="tel" placeholder="+880 17XX XXX XXX"
                value={form.phone}
                onChange={(e) => { set("phone", e.target.value); clearErr("phone"); }}
                className={input(errors.phone)} />
            </Field>
            <Field label="Short bio">
              <textarea rows={3} placeholder="Tell us a little about yourself…"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                className={input() + " resize-none"} />
            </Field>
          </Section>

          {/* ── Profile Photo ── */}
          <Section title="Profile photo" subtitle="Optional — we'll use your initials if skipped">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 overflow-hidden shrink-0 border-2 border-indigo-200">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-300 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </label>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG or WebP · Max 2MB</p>
              </div>
            </div>
          </Section>

          {/* ── Education (Dynamic) ── */}
          <Section title="Education" subtitle="Where did you study?">
            {form.educations.map((edu, i) => (
              <div key={i} className="space-y-3">
                {i > 0 && <div className="border-t border-slate-100 pt-3" />}
                <div className="grid grid-cols-2 gap-4">
                  <Field label={`College ${form.educations.length > 1 ? i + 1 : ""}`} error={errors[`educations.${i}.college`]} required>
                    <input type="text" placeholder="University of Dhaka"
                      value={edu.college}
                      onChange={(e) => setEducation(i, "college", e.target.value)}
                      className={input(errors[`educations.${i}.college`])} />
                  </Field>
                  <Field label="Degree">
                    <div className="flex gap-2">
                      <input type="text" placeholder="B.Sc. in CSE"
                        value={edu.degree}
                        onChange={(e) => setEducation(i, "degree", e.target.value)}
                        className={input()} />
                      {i > 0 && (
                        <button type="button" onClick={() => removeEducation(i)}
                          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={addEducation}
              className="w-full rounded-2xl border-2 border-dashed border-indigo-200 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-colors">
              + Add another education
            </button>
          </Section>

          {/* ── Skills (Dynamic) ── */}
          <Section title="Skills" subtitle="What are your top skills?">
            <div className="space-y-3">
              {form.skills.map((skill, i) => (
                <Field key={i} label={`Skill ${i + 1}`} error={errors[`skills.${i}.name`]}>
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g., JavaScript"
                      value={skill.name}
                      onChange={(e) => setSkill(i, e.target.value)}
                      className={input(errors[`skills.${i}.name`])} />
                    {i > 0 && (
                      <button type="button" onClick={() => removeSkill(i)}
                        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </Field>
              ))}
            </div>
            <button type="button" onClick={addSkill}
              className="w-full rounded-2xl border-2 border-dashed border-indigo-200 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-colors">
              + Add another skill
            </button>
          </Section>

          {/* ── Account ── */}
          {/* <Section title="Account" subtitle="Your login credentials">
            <Field label="Email" error={errors.email} required>
              <input type="email" placeholder="arif@example.com"
                value={form.email}
                onChange={(e) => { set("email", e.target.value); clearErr("email"); }}
                className={input(errors.email)} />
            </Field>
            <Field label="Username" error={errors.username} required hint="Lowercase letters, numbers & underscores">
              <input type="text" placeholder="arif_rahman"
                value={form.username}
                onChange={(e) => { set("username", e.target.value.toLowerCase()); clearErr("username"); }}
                className={input(errors.username)} />
            </Field>
            <Field label="Password" error={errors.password} required>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => { set("password", e.target.value); clearErr("password"); }}
                  className={input(errors.password) + " pr-11"} />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.w }} />
                  </div>
                  {strength.label && <p className="text-xs text-slate-400 mt-1">{strength.label}</p>}
                </div>
              )}
            </Field>
            <Field label="Confirm password" error={errors.confirmPassword} required>
              <div className="relative">
                <input type={showCpw ? "text" : "password"} placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => { set("confirmPassword", e.target.value); clearErr("confirmPassword"); }}
                  className={input(errors.confirmPassword) + " pr-11"} />
                <button type="button" onClick={() => setShowCpw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCpw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </Field>
          </Section> */}

          {/* ── Location ── */}
          <Section title="Location" subtitle="Where are you based?">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Country" error={errors.country} required>
                <select value={form.country}
                  onChange={(e) => { set("country", e.target.value); clearErr("country"); }}
                  className={input(errors.country)}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="City">
                <input type="text" placeholder="Dhaka"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={input()} />
              </Field>
            </div>
            <Field label="Street address">
              <input type="text" placeholder="House 12, Road 5, Block B…"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={input()} />
            </Field>
          </Section>


          <Section title="Social Account" subtitle="Connect your social media accounts.">
           {form.socialMedias.map((media, i) => (
              <div key={i} className="space-y-3">
                {i > 0 && <div className="border-t border-slate-100 pt-3" />}
                <div className="grid grid-cols-2 gap-4">
                  <Field label={`Account ${form.socialMedias.length > 1 ? i + 1 : ""}`} error={errors[`socialMedias.${i}.account`]} required>
                    <input type="text" placeholder="University of Dhaka"
                      value={media.account}
                      onChange={(e) => setSocialMedia(i, "account", e.target.value)}
                      className={input(errors[`socialMedias.${i}.account`])} />
                  </Field>
                  <Field label="Link">
                    <div className="flex gap-2">
                      <input type="text" placeholder="https://www.vibein.com"
                        value={media.link}
                        onChange={(e) => setSocialMedia(i, "link", e.target.value)}
                        className={input()} />
                      {i > 0 && (
                        <button type="button" onClick={() => removeSocialMedia(i)}
                          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </Field>
                </div>
              </div>
            ))}

            <button type="button" onClick={addEducation}
              className="w-full rounded-2xl border-2 border-dashed border-indigo-200 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-colors">
              + Add another account
            </button>
          </Section>


          {/* ── Submit ── */}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-2xl py-3.5 transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                    Submit…
              </>
            ) : "Create account"}
          </button>

        </form>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */

function Section({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
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