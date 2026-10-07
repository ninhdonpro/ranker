/**
 * Chạy một lần khi server Next khởi động và phải xong trước khi server nhận request.
 * Ở production: khởi tạo Payload ngay tại đây, migration (`prodMigrations`) chạy trong lúc khởi
 * tạo, nên container mới chỉ nhận traffic sau khi DB đã ở schema mới. Migration lỗi thì server
 * không khởi động, healthcheck không đạt và Coolify giữ container cũ.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return
  // Không kết nối DB trong lúc `next build` (build không được phụ thuộc DB).
  const { PHASE_PRODUCTION_BUILD } = await import('next/constants')
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return

  const { getPayloadClient } = await import('./lib/payload')
  await getPayloadClient()
}
