import { HttpError } from "./http-error"
import { withTimeout } from "./timeout"
import { ZodSchema } from "zod"
import { makeStore } from "@/shared/lib/store/store" 
import { setAccessToken, clearAccessToken } from "@/shared/lib/features/accessToken/accessTokenSlice"

const store = makeStore()

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface HttpOptions<T> {
    method?: HttpMethod
    body?: unknown
    headers?: HeadersInit
    timeoutMs?: number
    cache?: RequestCache
    schema?: ZodSchema<T>
    _retry?: boolean 
}

let refreshingPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
    try {
        const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (!res.ok) {
            store.dispatch(clearAccessToken());
            throw new HttpError("Session expired", 401);
        }

        const data = await res.json();
        store.dispatch(setAccessToken(data.accessToken));
        return data.accessToken;

    } catch (err) {
        store.dispatch(clearAccessToken());
        throw err;
    }
}

export async function http<T>(url: string, options: HttpOptions<T> = {}): Promise<T> {
    const {
        method = "GET",
        body,
        headers,
        timeoutMs = 8000,
        cache = "no-store",
        schema,
        _retry = false,
    } = options

    const { controller, timeoutId } = withTimeout(timeoutMs)

    try {
        let accessToken = store.getState().accessToken.accessToken;

        if (!accessToken) {
            if (!refreshingPromise) {
                refreshingPromise = refreshAccessToken().finally(() => {
                    refreshingPromise = null;
                });
            }
            accessToken = await refreshingPromise;
        }

        const res = await fetch(url, {
            method,
            credentials: "include",
            cache,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await res.json().catch(() => null)

        // 401 — accessToken expire, but only retry once
        if (res.status === 401 && data?.code === "ACCESS_TOKEN_EXPIRED" && !_retry) {
            if (!refreshingPromise) {
                refreshingPromise = refreshAccessToken().finally(() => {
                    refreshingPromise = null;
                });
            }

            const newAccessToken = await refreshingPromise;

            return http<T>(url, {
                ...options,
                _retry: true, // ← infinite loop বন্ধ
                headers: {
                    ...headers,
                    Authorization: `Bearer ${newAccessToken}`,
                }
            });
        }

        if (!res.ok) {
            throw new HttpError(
                data?.message || "Request failed",
                res.status,
                data
            )
        }

        if (schema) {
            const parsed = schema.safeParse(data)
            if (!parsed.success) {
                throw new HttpError("Invalid server response", 500, parsed.error.flatten())
            }
            return parsed.data
        }

        return data as T

    } catch (err: any) {
        if (err.name === "AbortError") {
            throw new HttpError("Request timeout", 408)
        }
        if (err instanceof HttpError) throw err
        throw new HttpError("Network error", 0)
    } finally {
        clearTimeout(timeoutId)
    }
}