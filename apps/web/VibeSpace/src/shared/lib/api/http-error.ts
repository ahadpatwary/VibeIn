export class HttpError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.data = data
  }
}