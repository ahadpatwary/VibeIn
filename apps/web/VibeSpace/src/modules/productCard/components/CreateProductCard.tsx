"use client";

import { useState, useRef, useCallback } from "react";
import { useUpload } from '@/shared/hooks/useUpload'
import { HttpError } from "@/shared/lib/api/http-error";


const CURRENCIES = ["USD", "BDT", "EUR", "GBP"];
const LICENSE_TYPES = ["MIT", "Apache 2.0", "GPL-3.0", "Commercial", "Personal"];
const SUGGESTED_TAGS = [
  "Next.js 14", "React", "TypeScript", "Tailwind CSS", "Stripe",
  "Prisma", "PostgreSQL", "MongoDB", "Supabase", "Node.js",
  "Express", "GraphQL", "tRPC", "Drizzle ORM", "Auth.js",
  "Shadcn UI", "Framer Motion", "Socket.io", "Redis", "Docker",
];

type Step = "basics" | "pricing" | "media" | "review";

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: "basics", label: "Basics", icon: "01" },
  { id: "pricing", label: "Pricing", icon: "02" },
  { id: "media", label: "Media", icon: "03" },
  { id: "review", label: "Review", icon: "04" },
];

export default function CreateProductCard() {
  const [step, setStep] = useState<Step>("basics");
  const [tagInput, setTagInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    previewUrl: "",
    techStack: [] as string[],
    price: "",
    currency: "USD",
    licenseType: "MIT",
    isPrivate: false,
    isFeatured: false,
    media: null as string[] | null,
  });

  const {
    files, 
    getRootProps, 
    getInputProps, 
    uploadFiles,
    isDragActive 
  } = useUpload()

  const handleSubmit = async () => {
    form.media = files.filter((f) => f.url != null).map((f) => f.url) as string[];
    console.log("submit", form);

    // const parsed = ProductCardSchema.safeParse(form)

    // if (!parsed.success) {
    //     throw new HttpError("Invalid server response", 500, parsed.error.flatten())
    // }

    // const res = await createPost(parsed.data)

    // return parsed.data


  }

  const set = (key: string, value: unknown) => 
    setForm((f) => ({ ...f, [key]: value }));

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !form.techStack.includes(t) && form.techStack.length < 10) {
      set("techStack", [...form.techStack, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) =>
    set("techStack", form.techStack.filter((t) => t !== tag));

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    set("thumbnailFile", file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canProceed = () => {
    if (step === "basics") return form.title.length >= 5 && form.description.length >= 20;
    if (step === "pricing") return form.price !== "" && Number(form.price) >= 0;
    if (step === "media") return files.length > 0;
    return true;
  };

  const nextStep = async () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if(idx === 2) {
      await uploadFiles(files);
    }

    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };
  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-['Geist',sans-serif]">
      {/* Subtle grid bg */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top nav */}
      <header className="relative z-10 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
              S
            </div>
            <span className="text-sm text-white/40 font-medium">smreaz</span>
            <span className="text-white/20">/</span>
            <span className="text-sm text-white/70">New listing</span>
          </div>
          <button className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Save draft
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Progress + step tabs */}
        <div className="mb-10">
          <div className="flex items-center gap-1 mb-6">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i <= stepIndex && setStep(s.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${s.id === step
                    ? "bg-white/10 text-white"
                    : i < stepIndex
                    ? "text-white/50 hover:text-white/70 cursor-pointer"
                    : "text-white/20 cursor-not-allowed"
                  }
                `}
              >
                <span
                  className={`
                    w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold
                    ${s.id === step ? "bg-violet-500 text-white" : i < stepIndex ? "bg-white/20 text-white/70" : "bg-white/5 text-white/20"}
                  `}
                >
                  {i < stepIndex ? "✓" : s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-px bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── STEP 1: BASICS ── */}
        {step === "basics" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1">What are you selling?</h1>
              <p className="text-sm text-white/40">Give buyers a clear picture of your project.</p>
            </div>

            {/* Title */}
            <Field label="Listing title" required hint={`${form.title.length}/80`}>
              <input
                type="text"
                maxLength={80}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. SaaS Dashboard — Next.js + Stripe full kit"
                className="input-base"
              />
            </Field>

            {/* Description */}
            <Field label="Description" required hint={`${form.description.length} chars`}>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe what's included, who it's for, and what makes it special..."
                className="input-base resize-none leading-relaxed"
              />
            </Field>

            {/* Live preview URL */}
            <Field label="Live preview URL" hint="Optional">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                  https://
                </span>
                <input
                  type="url"
                  value={form.previewUrl}
                  onChange={(e) => set("previewUrl", e.target.value)}
                  placeholder="your-demo.vercel.app"
                  className="input-base pl-15!"
                />
              </div>
            </Field>

            {/* Tech stack tags */}
            <Field label="Tech stack" hint={`${form.techStack.length}/10 tags`}>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {form.techStack.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-500/15 border border-violet-500/20 rounded-md text-xs text-violet-300 font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-violet-400/60 hover:text-violet-300 ml-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {form.techStack.length === 0 && (
                    <span className="text-xs text-white/20 self-center">No tags yet</span>
                  )}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Type a tag and press Enter..."
                  className="input-base"
                />
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.filter(
                    (t) => !form.techStack.includes(t)
                  ).slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 text-xs transition-all border border-white/[0.06]"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>
        )}

        {/* ── STEP 2: PRICING ── */}
        {step === "pricing" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1">Set your price</h1>
              <p className="text-sm text-white/40">You keep 90% of every sale. We take 10%.</p>
            </div>

            {/* Price + currency */}
            <Field label="Price" required>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    className="input-base pl-7!"
                  />
                </div>
                <select
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className="input-base max-w-28 w-auto"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {form.price && Number(form.price) > 0 && (
                <p className="text-xs text-white/30 mt-2">
                  You earn{" "}
                  <span className="text-emerald-400 font-semibold">
                    {form.currency} {(Number(form.price) * 0.9).toFixed(2)}
                  </span>{" "}
                  per sale after 10% platform fee.
                </p>
              )}
              {form.price === "0" || form.price === "" ? null : Number(form.price) === 0 ? (
                <p className="text-xs text-sky-400 mt-2">This will be listed as a free project.</p>
              ) : null}
            </Field>

            {/* License */}
            <Field label="License type" required>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {LICENSE_TYPES.map((lic) => (
                  <button
                    key={lic}
                    onClick={() => set("licenseType", lic)}
                    className={`
                      py-2.5 px-3 rounded-lg border text-xs font-medium transition-all
                      ${form.licenseType === lic
                        ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                        : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/60"
                      }
                    `}
                  >
                    {lic}
                  </button>
                ))}
              </div>
            </Field>

            {/* Visibility */}
            <Field label="Visibility">
              <div className="flex gap-3">
                {[
                  { value: false, label: "Public", desc: "Anyone can find and buy" },
                  { value: true, label: "Private", desc: "Only via direct link" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => set("isPrivate", opt.value)}
                    className={`
                      flex-1 p-3 rounded-lg border text-left transition-all
                      ${form.isPrivate === opt.value
                        ? "bg-violet-500/15 border-violet-500/40"
                        : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
                      }
                    `}
                  >
                    <p className={`text-sm font-medium ${form.isPrivate === opt.value ? "text-violet-300" : "text-white/60"}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            {/* Featured toggle */}
            <Field label="Boost listing" hint="Optional">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => set("isFeatured", !form.isFeatured)}
                  className={`
                    relative w-10 h-5 rounded-full transition-all
                    ${form.isFeatured ? "bg-violet-500" : "bg-white/10"}
                  `}
                >
                  <div className={`
                    absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                    ${form.isFeatured ? "translate-x-5" : "translate-x-0.5"}
                  `} />
                </div>
                <div>
                  <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                    Feature this listing
                  </p>
                  <p className="text-xs text-white/30">Shown at the top of the marketplace feed</p>
                </div>
              </label>
            </Field>
          </div>
        )}

        {/* ── STEP 3: MEDIA ── */}
        {step === "media" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1">Add a thumbnail</h1>
              <p className="text-sm text-white/40">First impression matters. Use a sharp 16:9 screenshot or cover image.</p>
            </div>

            <Field label="Cover image" required hint="PNG / JPG / WEBP, max 5MB">
              <div
                {...getRootProps()}
                className={`
                  relative rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden
                  ${isDragActive ? "border-violet-500/60 bg-violet-500/5" : "border-white/[0.1] hover:border-white/20 bg-white/[0.02]"}
                `}
                style={{ aspectRatio: "16/9" }}
              >
                <input {...getInputProps()} />
                {files.length > 0 ? (
                  <>
                    <img src={files[files.length - 1].preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-sm text-white font-medium">Change image</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">Drop your image here</p>
                    <p className="text-xs">or click to browse</p>
                  </div>
                )}
              </div>
            </Field>

             
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">

              {files.map((file) => (
                <div key={file.id} className="border rounded-xl overflow-hidden">
                  <img src={file.preview} className="w-full h-40 object-cover" />

                  {/* Progress */}
                  <div className="p-2">
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${file.progress ?? 0}%` }}
                      />
                    </div>

                    <p className="text-xs text-white mt-1">
                      {file.status === 'uploading' && 'Uploading...'}
                      {file.status === 'done' && 'Uploaded ✅'}
                      {file.status === 'error' && 'Error ❌'}
                    </p>
                  </div>
                </div>
             ))}
            </div>

            {/* {thumbnailPreview && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-emerald-300">
                  {form.thumbnailFile?.name} uploaded successfully
                </p>
                <button
                  onClick={() => { setThumbnailPreview(null); set("thumbnailFile", null); }}
                  className="ml-auto text-xs text-white/30 hover:text-white/60"
                >
                  Remove
                </button>
              </div>
            )} */}
          </div>
        )}

        {/* ── STEP 4: REVIEW ── */}
        {step === "review" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1">Review & publish</h1>
              <p className="text-sm text-white/40">Everything look good? Hit publish to go live.</p>
            </div>

            {/* Card preview */}
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              { files.length > 0 && (
                <img src={files[0].preview} alt="Thumbnail" className="w-full h-48 object-cover" />
              )}
              <div className="p-5 space-y-3 bg-white/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white leading-snug">
                      {form.title || <span className="text-white/20">Untitled listing</span>}
                    </h2>
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{form.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-white">
                      {Number(form.price) === 0 ? "Free" : `$${Number(form.price).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-white/30">{form.currency} · {form.licenseType}</p>
                  </div>
                </div>

                {form.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.techStack.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded bg-white/[0.06] text-white/50 border border-white/[0.06]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1 text-xs text-white/30">
                  {form.isPrivate && <span className="text-amber-400/70">🔒 Private</span>}
                  {form.isFeatured && <span className="text-violet-400/70">⚡ Featured</span>}
                  {form.previewUrl && <span className="text-sky-400/70">🔗 Live demo</span>}
                </div>
              </div>
            </div>

            {/* Summary list */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Title", form.title || "—"],
                ["Price", form.price ? `${form.currency} ${form.price}` : "—"],
                ["License", form.licenseType],
                ["Visibility", form.isPrivate ? "Private" : "Public"],
                ["Tags", form.techStack.length ? `${form.techStack.length} added` : "None"],
                ["Preview URL", form.previewUrl || "—"],
              ].map(([key, val]) => (
                <div key={key} className="flex flex-col p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-xs text-white/30">{key}</span>
                  <span className="text-white/70 font-medium truncate mt-0.5">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
          <button
            onClick={prevStep}
            disabled={stepIndex === 0}
            className="px-4 py-2 text-sm text-white/40 hover:text-white/70 disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            ← Back
          </button>

          {step !== "review" ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-medium transition-all
                ${canProceed()
                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30"
                  : "bg-white/[0.06] text-white/20 cursor-not-allowed"
                }
              `}
            >
              Continue →
            </button>
          ) : (
            <button 
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/40 transition-all"
              onClick={ handleSubmit }
            >
              Publish listing ✦
            </button>
          )}
        </div>
      </main>

      <style>{`
        .input-base {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 12px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base::placeholder { color: rgba(255,255,255,0.2); }
        .input-base:focus { border-color: rgba(139,92,246,0.5); background: rgba(255,255,255,0.04); }
        select.input-base option { background: #1a1a2e; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom-2 { from { transform: translateY(8px); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease, slide-in-from-bottom-2 0.3s ease; }
      `}</style>
    </div>
  );
}

/* ── Helper: Field wrapper ── */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/70">
          {label}
          {required && <span className="text-violet-400 ml-1">*</span>}
        </label>
        {hint && <span className="text-xs text-white/25">{hint}</span>}
      </div>
      {children}
    </div>
  );
}