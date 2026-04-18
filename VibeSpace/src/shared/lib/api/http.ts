import { HttpError } from "./http-error"
import { withTimeout } from "./timeout"
import { ZodSchema } from "zod"
import { makeStore } from "@/shared/lib/store/store" 
import { setAccessToken, clearAccessToken } from "@/shared/lib/features/accessToken/accessTokenSlice"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const store = makeStore(); // ✅ store তৈরি করো

interface HttpOptions<T> {
    method?: HttpMethod
    body?: unknown
    headers?: HeadersInit
    timeoutMs?: number
    cache?: RequestCache
    schema?: ZodSchema<T>
}

let refreshingPromise: Promise<string> | null = null;

// ✅ accessToken refresh করো
async function refreshAccessToken(): Promise<string> {
    const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // refreshToken cookie automatically যাবে
    });

    if (!res.ok) {
        store.dispatch(clearAccessToken());
        throw new HttpError("Session expired", 401);
    }

    const data = await res.json();
    store.dispatch(setAccessToken(data.accessToken)); // ✅ store update
    return data.accessToken;
}

export async function http<T>(url: string, options: HttpOptions<T> = {}): Promise<T> {
    const {
        method = "GET",
        body,
        headers,
        timeoutMs = 8000,
        cache = "no-store",
        schema,
    } = options

    const { controller, timeoutId } = withTimeout(timeoutMs)

    try {
        // ✅ hook এর বদলে store থেকে directly নাও
        let accessToken = store.getState().accessToken.accessToken;

        console.log("...........................................................ahadToken", accessToken);

        if(!accessToken){
            if (!refreshingPromise) {
                refreshingPromise = refreshAccessToken().finally(() => {
                    refreshingPromise = null;
                });
            }
            accessToken = await refreshingPromise;
            console.log("new access token after refresh", accessToken);

            store.dispatch(setAccessToken(accessToken)); // ✅ store update

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

        console.log("res", data);

        // ✅ 401 আসলে refresh করে retry
        if (res.status === 401 && data?.code === "ACCESS_TOKEN_EXPIRED") {

            console.log("ahad..........")

            if (!refreshingPromise) {
                refreshingPromise = refreshAccessToken().finally(() => {
                    refreshingPromise = null;
                });
            }

            const newAccessToken = await refreshingPromise;

            // ✅ নতুন token দিয়ে retry
            return http<T>(url, {
                ...options,
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
                throw new HttpError(
                    "Invalid server response",
                    500,
                    parsed.error.flatten()
                )
            }
            return parsed.data
        }

        return data as T

    } catch (err: any) {
        if (err.name === "AbortError") {
            throw new HttpError("Request timeout", 408)
        }
        if (err instanceof HttpError) {
            throw err
        }
        throw new HttpError("Network error", 0)
    } finally {
        clearTimeout(timeoutId)
    }
}