export const ACCEPTED_FILE_EXTENSIONS = [".mp4", ".mov", ".m4v"];
export const ACCEPTED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/x-m4v"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB, adjust to match backend limits

export const PIPELINE_STEP_ORDER = ["reading", "demuxing", "packaging", "uploading"] as const;
