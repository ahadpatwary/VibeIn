/**
 * Base class for every error this app throws deliberately.
 *
 * Mirrors the exception-hierarchy pattern used on the backend
 * (domain-specific error classes + a stable `code` for logging/telemetry),
 * so the same mental model carries over to the frontend.
 */
export abstract class AppError extends Error {
  /** Stable machine-readable identifier, e.g. "extraction/no_audio_track". */
  public abstract readonly code: string;

  /** Original error that caused this one, if any (kept for debugging/telemetry). */
  public readonly cause?: unknown;

  protected constructor(message: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;

    // Restore prototype chain (needed when compiling to ES targets that
    // otherwise break `instanceof` for classes extending built-ins).
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Message safe to show directly in the UI. Override per subclass as needed. */
  public toUserMessage(): string {
    return this.message;
  }
}
