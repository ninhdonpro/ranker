/** Lỗi do server trả về: `errors[0].data.errors[]` là danh sách `{ path, message }` theo field. */
export function serverErrors(body: unknown): { path?: string; message: string }[] {
  const first = (body as { errors?: { data?: { errors?: unknown } }[] } | null)?.errors?.[0]
  const list = first?.data?.errors
  return Array.isArray(list) ? (list as { path?: string; message: string }[]) : []
}
