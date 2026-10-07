import { expect } from 'vitest'

/** Lấy thông báo lỗi chi tiết (ValidationError của Payload để thông báo trong `data.errors`). */
function errorText(error: unknown): string {
  const data = (error as { data?: { errors?: { message: string }[] } })?.data
  if (data?.errors?.length) return data.errors.map((e) => e.message).join(' | ')
  return error instanceof Error ? error.message : String(error)
}

/** Mong đợi thao tác bị từ chối với thông báo khớp `pattern`. */
export async function expectRejected(promise: Promise<unknown>, pattern: RegExp) {
  let caught: unknown
  try {
    await promise
  } catch (error) {
    caught = error
  }
  expect(caught, 'thao tác lẽ ra phải bị từ chối').toBeDefined()
  expect(errorText(caught)).toMatch(pattern)
}
