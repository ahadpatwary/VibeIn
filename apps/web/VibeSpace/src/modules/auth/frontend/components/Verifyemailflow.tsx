"use client";

import { useEffect, useRef, useState } from "react";

/**
 * VerifyEmailFlow
 * Two-step "provider didn't link an account" recovery flow:
 *   1. Email entry
 *   2. OTP verification
 *
 * Design tokens (see accompanying notes):
 *   bg        #0B0D12
 *   surface   #14171F
 *   border    #242833
 *   text      #ECEAE5
 *   muted     #8B8F9B
 *   accent    #E3A23C  (warm amber — "verification" signal color)
 *   danger    #FF6B6B
 *   success   #4ADE80
 */

type Step = "email" | "otp";
type Status = "idle" | "loading" | "error" | "success";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, Math.min(3, user.length));
  return `${visible}${"*".repeat(Math.max(user.length - visible.length, 3))}@${domain}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function VerifyEmailFlow(tempToken: string, provider: string) {
  const [step, setStep] = useState<Step>("email");

  // --- email step state ---
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<Status>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  // --- otp step state ---
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpStatus, setOtpStatus] = useState<Status>("idle");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "otp" || resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendCooldown]);

  useEffect(() => {
    if (step === "otp") {
      setResendCooldown(RESEND_SECONDS);
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  async function handleSend() {
    setEmailError(null);
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailStatus("loading");
    try {
      // Replace with real API call, e.g.:
      // const res = await fetch("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) });
      await new Promise((resolve, reject) => setTimeout(() => {
        // simulate "account not found" failure for demo purposes
        if (email.endsWith("@notfound.com")) reject(new Error("account not exist"));
        else resolve(true);
      }, 900));
      setEmailStatus("success");
      setStep("otp");
    } catch (err) {
      setEmailStatus("error");
      setEmailError(
        err instanceof Error && err.message === "account not exist"
          ? "We couldn't find an account with this email."
          : "Something went wrong. Try again."
      );
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError(null);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    inputsRef.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Enter the full 6-digit code.");
      return;
    }
    setOtpStatus("loading");
    setOtpError(null);
    try {
      // const res = await fetch("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, code }) });
      await new Promise((resolve, reject) => setTimeout(() => {
        if (code !== "000000") resolve(true); // demo: any code works except a forced-fail sentinel
        else reject(new Error("invalid code"));
      }, 900));
      setOtpStatus("success");
    } catch {
      setOtpStatus("error");
      setOtpError("That code didn't match. Check it and try again.");
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    setResendCooldown(RESEND_SECONDS);
    inputsRef.current[0]?.focus();
    // fire-and-forget resend call here
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0D12] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        {step === "email" ? (
          <EmailCard
            email={email}
            setEmail={setEmail}
            status={emailStatus}
            error={emailError}
            onSend={handleSend}
          />
        ) : (
          <OtpCard
            maskedEmail={maskEmail(email)}
            otp={otp}
            inputsRef={inputsRef}
            status={otpStatus}
            error={otpError}
            resendCooldown={resendCooldown}
            onChange={handleOtpChange}
            onKeyDown={handleOtpKeyDown}
            onPaste={handlePaste}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={() => {
              setStep("email");
              setOtpStatus("idle");
              setOtpError(null);
              setOtp(Array(OTP_LENGTH).fill(""));
            }}
          />
        )}
      </div>
    </div>
  );
}

function StepTrack({ active }: { active: Step }) {
  return (
    <div className="flex items-center gap-3 mb-7">
      <span
        className={`text-[13px] tracking-wide font-medium transition-colors ${
          active === "email" ? "text-[#ECEAE5]" : "text-[#5B5F6B]"
        }`}
      >
        Email
      </span>
      <div className="relative flex-1 h-[2px] bg-[#242833] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#E3A23C] rounded-full transition-all duration-500 ease-out"
          style={{ width: active === "email" ? "8%" : "100%" }}
        />
      </div>
      <span
        className={`text-[13px] tracking-wide font-medium transition-colors ${
          active === "otp" ? "text-[#ECEAE5]" : "text-[#5B5F6B]"
        }`}
      >
        Verify code
      </span>
    </div>
  );
}

function EmailCard({
  email,
  setEmail,
  status,
  error,
  onSend,
}: {
  email: string;
  setEmail: (v: string) => void;
  status: Status;
  error: string | null;
  onSend: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#242833] bg-[#14171F] p-6 sm:p-7 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
      <StepTrack active="email" />

      <h1 className="text-[17px] font-semibold text-[#ECEAE5] mb-1.5 [font-family:var(--font-display)]">
        Verify it&rsquo;s you
      </h1>
      <p className="text-[13.5px] leading-relaxed text-[#8B8F9B] mb-6">
        Your provider doesn&rsquo;t link an account here and couldn&rsquo;t send a code automatically.
        Enter your own email and we&rsquo;ll verify it instead.
      </p>

      <label htmlFor="email" className="block text-[12px] font-medium tracking-wide text-[#8B8F9B] mb-2 uppercase">
        Email
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        className={`w-full rounded-xl bg-[#0F1117] border px-4 py-3 text-[14px] text-[#ECEAE5] placeholder:text-[#4B4F5A] outline-none transition-colors
          focus:border-[#E3A23C] focus:ring-2 focus:ring-[#E3A23C]/20
          ${error ? "border-[#FF6B6B]" : "border-[#262B36]"}`}
      />

      <div className="min-h-[20px] mt-2 mb-4">
        {error && (
          <p className="text-[12.5px] text-[#FF6B6B] flex items-center gap-1.5">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
      </div>

      <button
        onClick={onSend}
        disabled={status === "loading"}
        className="w-full rounded-xl bg-[#E3A23C] hover:bg-[#EDB05A] active:bg-[#D6943A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors py-3 text-[14px] font-semibold text-[#0B0D12] flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Spinner /> Sending&hellip;
          </>
        ) : (
          <>Send code →</>
        )}
      </button>
    </div>
  );
}

function OtpCard({
  maskedEmail,
  otp,
  inputsRef,
  status,
  error,
  resendCooldown,
  onChange,
  onKeyDown,
  onPaste,
  onVerify,
  onResend,
  onBack,
}: {
  maskedEmail: string;
  otp: string[];
  inputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
  status: Status;
  error: string | null;
  resendCooldown: number;
  onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
}) {
  if (status === "success") {
    return (
      <div className="rounded-2xl border border-[#242833] bg-[#14171F] p-7 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#4ADE80]/10 flex items-center justify-center text-[#4ADE80] text-xl">
          ✓
        </div>
        <h1 className="text-[17px] font-semibold text-[#ECEAE5] mb-1.5">Email verified</h1>
        <p className="text-[13.5px] text-[#8B8F9B]">You&rsquo;re all set — continuing to your account.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#242833] bg-[#14171F] p-6 sm:p-7">
      <StepTrack active="otp" />

      <button
        onClick={onBack}
        className="text-[12.5px] text-[#8B8F9B] hover:text-[#ECEAE5] transition-colors mb-4 flex items-center gap-1"
      >
        ← Change email
      </button>

      <h1 className="text-[17px] font-semibold text-[#ECEAE5] mb-1.5">Enter your code</h1>
      <p className="text-[13.5px] leading-relaxed text-[#8B8F9B] mb-6">
        We sent a 6-digit code to <span className="text-[#ECEAE5] font-medium">{maskedEmail}</span>.
      </p>

      <div className="flex justify-between gap-2 mb-2" onPaste={onPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className={`w-full aspect-square max-w-[52px] rounded-xl bg-[#0F1117] border text-center text-[18px] font-mono text-[#ECEAE5] outline-none transition-colors
              focus:border-[#E3A23C] focus:ring-2 focus:ring-[#E3A23C]/20
              ${error ? "border-[#FF6B6B]" : "border-[#262B36]"}`}
          />
        ))}
      </div>

      <div className="min-h-[20px] mt-2 mb-4 flex items-center justify-between">
        <p className={`text-[12.5px] ${error ? "text-[#FF6B6B]" : "text-transparent"}`}>
          {error || "placeholder"}
        </p>
        <button
          onClick={onResend}
          disabled={resendCooldown > 0}
          className="text-[12.5px] font-medium text-[#E3A23C] disabled:text-[#5B5F6B] disabled:cursor-not-allowed transition-colors"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>

      <button
        onClick={onVerify}
        disabled={status === "loading"}
        className="w-full rounded-xl bg-[#E3A23C] hover:bg-[#EDB05A] active:bg-[#D6943A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors py-3 text-[14px] font-semibold text-[#0B0D12] flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Spinner /> Verifying&hellip;
          </>
        ) : (
          <>Verify →</>
        )}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-[#0B0D12]" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}