"use client";

/**
 * A procedurally generated idle waveform — the one deliberate motion moment
 * on the page. Bar heights are seeded once (not random per render) so the
 * shape stays stable across re-renders; only the CSS animation moves.
 */
const BAR_COUNT = 48;

function seededHeights(count: number): number[] {
  const heights: number[] = [];
  let seed = 7;
  for (let i = 0; i < count; i += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const envelope = Math.sin((i / count) * Math.PI); // taller in the middle
    heights.push(0.25 + envelope * 0.75 * rand + 0.15);
  }
  return heights;
}

const HEIGHTS = seededHeights(BAR_COUNT);

export function WaveformHero() {
  return (
    <div
      className="flex h-16 items-end gap-[3px] sm:h-20"
      role="img"
      aria-label="Audio waveform illustration"
    >
      {HEIGHTS.map((height, index) => (
        <span
          key={index}
          className="w-full flex-1 origin-bottom rounded-full bg-gradient-to-t from-signal to-signal-strong opacity-80 animate-bar-pulse"
          style={{
            height: `${height * 100}%`,
            animationDelay: `${(index % 12) * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}
