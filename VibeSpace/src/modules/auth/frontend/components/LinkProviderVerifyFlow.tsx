"use client";

import { useEffect, useRef, useState } from "react";

/**
 * LinkProviderVerifyFlow
 * Shown when a user connects a new login provider (Google/Facebook/etc.)
 * whose email already matches an existing account — we confirm ownership
 * via OTP before linking the two.
 *
 * Reuses the same dark token system as VerifyEmailFlow:
 *   bg #0B0D12  surface #14171F  border #242833
 *   text #ECEAE5  muted #8B8F9B  accent #E3A23C
 */

type Status = "idle" | "loading" | "error" | "success";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function LinkProviderVerifyFlow({
  maskedEmail = "abd***@gmail.com",
  providerName = "Google",
}: {
  maskedEmail?: string;
  providerName?: string;
}) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(RESEND_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError(null);
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
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
      setError("Enter the full 6-digit code.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      // const res = await fetch("/api/auth/link-provider/verify", {
      //   method: "POST",
      //   body: JSON.stringify({ code }),
      // });
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          if (code !== "000000") resolve(true);
          else reject(new Error("invalid"));
        }, 900)
      );
      setStatus("success");
    } catch {
      setStatus("error");
      setError("That code didn't match. Check it and try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    }
  }

  function handleResend() {
    if (resendCooldown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setError(null);
    setResendCooldown(RESEND_SECONDS);
    inputsRef.current[0]?.focus();
    // fire-and-forget resend call here
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0D12] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[820px] grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] gap-4 sm:gap-5">
        {/* context panel */}
        <div className="rounded-2xl border border-[#242833] bg-[#14171F] p-6 sm:p-7 flex sm:items-center">
          <div>
            <div className="w-9 h-9 rounded-lg bg-[#E3A23C]/10 flex items-center justify-center text-[#E3A23C] mb-4 text-[16px] font-semibold">
              {providerName.charAt(0)}
            </div>
            <h1 className="text-[16px] font-semibold text-[#ECEAE5] mb-2 leading-snug">
              Confirm it&rsquo;s your account
            </h1>
            <p className="text-[13.5px] leading-relaxed text-[#8B8F9B]">
              {providerName} is signing in with an email that already matches an account here.
              Verify the code we sent to keep the two accounts separate and secure before we link them.
            </p>
          </div>
        </div>

        {/* otp panel */}
        <div className="rounded-2xl border border-[#242833] bg-[#14171F] p-6 sm:p-7">
          {status === "success" ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#4ADE80]/10 flex items-center justify-center text-[#4ADE80] text-xl">
                ✓
              </div>
              <h2 className="text-[16px] font-semibold text-[#ECEAE5] mb-1.5">Account linked</h2>
              <p className="text-[13.5px] text-[#8B8F9B]">
                {providerName} is now connected to your account.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[13.5px] leading-relaxed text-[#8B8F9B] mb-1">
                Code sent to
              </p>
              <p className="text-[14.5px] font-medium text-[#ECEAE5] mb-6">{maskedEmail}</p>

              <div className="flex justify-between gap-2 mb-2" onPaste={handlePaste}>
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
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    aria-label={`Digit ${i + 1} of 6`}
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
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-[12.5px] font-medium text-[#E3A23C] disabled:text-[#5B5F6B] disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>

              <button
                onClick={handleVerify}
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
            </>
          )}
        </div>
      </div>
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