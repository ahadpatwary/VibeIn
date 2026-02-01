export function withTimeout(ms: number) {
    const controller = new AbortController()

    const timeoutId = setTimeout(() => {
        controller.abort()
    }, ms)

    return { controller, timeoutId }
}