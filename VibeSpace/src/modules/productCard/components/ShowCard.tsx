'use client';

import Image from "next/image";
import { useState } from "react";
import { ProductCardType } from "../schemas/productCard";

type ProductCardProps = ProductCardType;

export const ShowCard = ({
  title,
  description,
  sellerName,
  price,
  currency = "USD",
  rating,
  reviewCount,
  salesCount,
  viewCount,
  techStack,
  licenseType,
  isPrivate,
  isFeatured,
  isVerified,
  previewUrl,
  productUrl,
  postedAt = "3 days ago",
  media
}: ProductCardProps) => {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState(media[0] || "/default-image.jpg");

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  const initials = sellerName
    .split("_")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="w-full my-2 rounded border border-zinc-200 bg-white overflow-hidden transition-all duration-200  dark:border-zinc-800 dark:bg-zinc-900">

      {/* ── Media area ── */}
      <div className="relative h-48 bg-zinc-50 dark:bg-zinc-800 overflow-hidden">

        {/* Browser mockup */}
        <div className="absolute inset-4 rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-700 dark:bg-zinc-900">

          { !!imgSrc ? (
         
            <Image
              src={imgSrc}
              fill
              alt="card image"
              loading="lazy"
              className="object-contain rounded"
              placeholder="blur"
              blurDataURL="/default-image.jpg"
              sizes="(max-width: 768px) 100vw, 400px"
              onError={() => setImgSrc("/default-image.jpg")}
            />

          ) : (
            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700" />
          )}
        </div>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isFeatured && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-900 text-violet-200">
              Featured
            </span>
          )}
          {isPrivate && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-900 text-amber-200">
              Private
            </span>
          )}
        </div>

        {/* Top-right actions */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button
            onClick={() => setSaved((s) => !s)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Save"
          >
            <HeartIcon filled={saved} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800" aria-label="Share">
            <ShareIcon />
          </button>
        </div>

        {/* Live preview button */}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <EyeIcon />
          Live preview
        </a>
      </div>

      {/* ── Body ── */}
      <div className="p-4">

        {/* Seller row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-shrink-0">
            {initials}
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            @{sellerName}
          </span>
          {isVerified && <VerifiedIcon />}
          <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
            {postedAt} days ago
          </span>
        </div>

        {/* Title + description */}
        <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {techStack.map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-3 mb-3">
          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {stars.map((filled, i) => (
                <StarIcon key={i} filled={filled} />
              ))}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>

          <MetaItem icon={<UsersIcon />} label={`${salesCount} sales`} />
          <MetaItem icon={<EyeIcon />} label={`${formatCount(viewCount)} views`} />
          <MetaItem icon={<CodeIcon />} label={`${licenseType} license`} />
        </div>

        {/* URL row */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100 mb-4 dark:bg-zinc-800 dark:border-zinc-700">
          <LinkIcon />
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex-1 truncate">
            {productUrl}
          </span>
          <button
            onClick={handleCopy}
            className="text-[10px] font-medium text-zinc-400 hover:text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 bg-white transition-colors dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 flex-shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-0.5">
              Price
            </p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
              ${price}
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Single license
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSaved((s) => !s)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <HeartIcon filled={saved} small />
              {saved ? "Saved" : "Save"}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small icon components ── */

function HeartIcon({ filled, small }: { filled: boolean; small?: boolean }) {
  const size = small ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <svg className={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill={filled ? "#ca8a04" : "none"} stroke={filled ? "#ca8a04" : "#d4d4d8"} strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-3 h-3 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
      <span className="opacity-60">{icon}</span>
      {label}
    </div>
  );
}