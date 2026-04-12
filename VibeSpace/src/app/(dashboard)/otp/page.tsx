"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Step = "email" | "otp" | "success";

export default function VerifyEmailPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const validateEmail = (val: string) => {
    if (!val) return "Email দিন";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "সঠিক email দিন";
    return "";
  };

  const handleSendOtp = async () => {
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError("");
    setSending(true);
    try {
      // await sendOtpAction(email); ← তোমার server action
      await new Promise((r) => setTimeout(r, 1000));
      setStep("otp");
      startTimer(120);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setEmailError("OTP পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setCanResend(false);
    try {
      // await sendOtpAction(email);
      await new Promise((r) => setTimeout(r, 500));
      startTimer(120);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setOtpError("পাঠাতে সমস্যা হয়েছে");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setVerifying(true);
    setOtpError("");
    try {
      // await verifyOtpAction(email, code); ← তোমার server action
      await new Promise((r) => setTimeout(r, 1200));
      setStep("success");
    } catch {
      setOtpError("OTP সঠিক নয়, আবার চেষ্টা করুন");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setVerifying(false);
    }
  };

  const otpFilled = otp.every((d) => d !== "");

  return (
    <div className="min-h-dvh bg-[#0c0c0e] flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-[#16161a] border border-white/[0.08] rounded-2xl p-10 animate-fade-up">

        {/* GitHub badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] text-white/40 mb-5 tracking-wide">
          <GithubIcon />
          GitHub OAuth
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-6">
          <span className={`h-[3px] w-5 rounded-full transition-all duration-300 ${step === "email" ? "bg-violet-500" : "bg-violet-500/35"}`} />
          <span className={`h-[3px] w-5 rounded-full transition-all duration-300 ${step === "otp" ? "bg-violet-500" : step === "success" ? "bg-violet-500/35" : "bg-white/10"}`} />
        </div>

        {/* ── EMAIL STEP ── */}
        {step === "email" && (
          <div className="animate-fade-up">
            <h1 className="text-xl font-medium text-white mb-2">Email verify করুন</h1>
            <p className="text-[13px] text-white/40 leading-relaxed mb-6">
              GitHub আপনার email শেয়ার করেনি। Account তৈরি করতে আপনার email দিন।
            </p>

            {/* Warning */}
            <div className="flex gap-2 items-start bg-amber-500/[0.08] border border-amber-500/25 rounded-lg px-3 py-2.5 text-[12px] text-amber-400 leading-relaxed mb-6">
              <WarningIcon />
              <span>
                আপনার GitHub account এর email দিন। অন্য email দিলে পরে account merge করতে সমস্যা হতে পারে।
              </span>
            </div>

            <label className="block text-[11px] text-white/35 mb-1.5 tracking-wide">
              আপনার email
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              autoFocus
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              className={`w-full bg-[#0f0f12] border rounded-lg px-3.5 py-2.5 text-[14px] text-white placeholder-white/20 outline-none transition-colors duration-150
                ${emailError
                  ? "border-red-500/50"
                  : "border-white/10 focus:border-violet-500/60"
                }`}
            />
            {emailError && (
              <p className="text-[11px] text-red-400 mt-1.5 mb-0">{emailError}</p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={sending}
              className="w-full mt-4 bg-white text-[#0c0c0e] rounded-lg py-2.5 text-[14px] font-medium flex items-center justify-center gap-2 transition-opacity duration-150 hover:opacity-85 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {sending ? <Spinner dark /> : "OTP পাঠান"}
            </button>
          </div>
        )}

        {/* ── OTP STEP ── */}
        {step === "otp" && (
          <div className="animate-fade-up">
            <h1 className="text-xl font-medium text-white mb-2">OTP দিন</h1>
            <p className="text-[13px] text-white/40 leading-relaxed mb-6">
              <span className="text-white/65 font-medium">{email}</span> এ 6-digit OTP পাঠানো হয়েছে।
            </p>

            {/* OTP boxes */}
            <div className="flex gap-2 mb-1.5 ">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  className={`flex-1 h-12 bg-[#0f0f12] w-[30px] rounded-lg text-center text-[20px] font-medium text-white outline-none transition-colors duration-10 caret-violet-500
                    ${otpError
                      ? "border border-red-500/50"
                      : digit
                        ? "border border-violet-500/35"
                        : "border border-white/10 focus:border-violet-500/70"
                    }`}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-[11px] text-red-400 text-center mt-1">{otpError}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={!otpFilled || verifying}
              className="w-full mt-4 bg-violet-600 text-white rounded-lg py-2.5 text-[14px] font-medium flex items-center justify-center gap-2 transition-opacity duration-150 hover:opacity-85 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {verifying ? <Spinner /> : "Verify করুন"}
            </button>

            {/* Timer / Resend */}
            <div className="mt-3.5 text-center">
              {timeLeft > 0 ? (
                <p className="text-[11px] text-white/25">
                  {formatTime(timeLeft)} পরে আবার পাঠাতে পারবেন
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={!canResend}
                  className="text-[12px] text-violet-400 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  আবার OTP পাঠান
                </button>
              )}
            </div>

            <button
              onClick={() => setStep("email")}
              className="mt-3 text-[12px] text-white/25 hover:text-white/50 transition-colors duration-150"
            >
              ← email বদলান
            </button>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === "success" && (
          <div className="text-center py-4 animate-fade-up">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon />
            </div>
            <h2 className="text-[18px] font-medium text-white mb-1.5">Email verified!</h2>
            <p className="text-[13px] text-white/35">আপনার account তৈরি হচ্ছে...</p>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.3s ease both; }
      `}</style>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <span
      className={`w-4 h-4 rounded-full border-2 animate-spin ${
        dark ? "border-black/15 border-t-black" : "border-white/20 border-t-white"
      }`}
    />
  );
}