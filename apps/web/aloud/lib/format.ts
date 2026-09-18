export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function formatCodec(codec: string): string {
  if (codec.startsWith("mp4a")) return "AAC";
  if (codec.startsWith("Opus") || codec.startsWith("opus")) return "Opus";
  return codec.toUpperCase();
}

export function formatReduction(sourceBytes: number, outputBytes: number): string {
  if (sourceBytes <= 0 || outputBytes <= 0) return "—";
  const ratio = 1 - outputBytes / sourceBytes;
  return `${Math.max(0, Math.round(ratio * 100))}% smaller`;
}
