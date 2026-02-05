import { HttpError } from "./http-error"
import { withTimeout } from "./timeout"
import { ZodSchema } from "zod"
import { tokenIssueApi, TokenReturnType } from "./vibeIn/auth/tokenIssueApi"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface HttpOptions<T> {
    method?: HttpMethod
    body?: unknown
    headers?: HeadersInit
    timeoutMs?: number
    cache?: RequestCache
    schema?: ZodSchema<T>
}

let refreshingPromise: Promise<TokenReturnType> | null = null;

export async function http<T>(url: string, options: HttpOptions<T> = {}): Promise<T> {
    const {
        method = "GET",
        body,
        headers,
        timeoutMs = 80000,
        cache = "no-store",
        schema,
    } = options

    const { controller, timeoutId } = withTimeout(timeoutMs)

    try {
        const res = await fetch(url, {
            method,
            credentials: "include",
            cache,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await res.json().catch(() => null)

        if (res.status === 401 && data?.code === "ACCESS_TOKEN_EXPIRED") {

            if (!refreshingPromise) {
                refreshingPromise = tokenIssueApi()
                    .finally(() => {
                        refreshingPromise = null
                    })
            }

            await refreshingPromise

            return http<T>(url, { ...options })
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