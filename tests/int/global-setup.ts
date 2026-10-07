import { execFileSync } from 'node:child_process'

/**
 * Dựng lại schema DB test từ migration trước mỗi lần chạy test integration.
 * Chạy bằng CLI trong tiến trình con: adapter Postgres giữ một kết nối mở sau khi
 * khởi tạo, nếu chạy trong tiến trình chính thì vitest không thoát được.
 */
export default function setup() {
  const url = process.env.DATABASE_URL_TEST
  if (!url) throw new Error('Thiếu DATABASE_URL_TEST trong .env.local')
  if (url === process.env.DATABASE_URL) throw new Error('DATABASE_URL_TEST phải khác DATABASE_URL')

  execFileSync('pnpm', ['--silent', 'payload', 'migrate:fresh', '--force-accept-warning'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: ['ignore', 'ignore', 'inherit'],
  })
}
