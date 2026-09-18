"use client";

import { useCallback, useRef, useState } from "react";
import { ACCEPTED_FILE_EXTENSIONS, ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { formatBytes } from "@/lib/format";

interface DropZoneProps {
  onFileSelected: (file: File) => void; 
  disabled?: boolean;
}

function isAcceptedFile(file: File): boolean {
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return ACCEPTED_MIME_TYPES.includes(file.type) || ACCEPTED_FILE_EXTENSIONS.includes(extension);
}

export function DropZone({ onFileSelected, disabled }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!isAcceptedFile(file)) {
        setValidationError("That format isn't supported. Use MP4, MOV, or M4V.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setValidationError(`That file is larger than the ${formatBytes(MAX_FILE_SIZE_BYTES)} limit.`);
        return;
      }
      setValidationError(null);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);
          if (!disabled) handleFile(event.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          disabled
            ? "cursor-not-allowed border-border/50 opacity-50"
            : isDragActive
              ? "border-signal bg-signal/5"
              : "border-border hover:border-ink-muted"
        }`}
      >
        <p className="font-display text-base font-medium text-ink-primary">
          Drop a video, or browse
        </p>
        <p className="mt-1.5 font-mono text-xs text-ink-secondary">
          MP4 · MOV · M4V — up to {formatBytes(MAX_FILE_SIZE_BYTES)}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={[...ACCEPTED_MIME_TYPES, ...ACCEPTED_FILE_EXTENSIONS].join(",")}
          className="hidden"
          disabled={disabled}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
      {validationError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {validationError}
        </p>
      )}
    </div>
  );
}
