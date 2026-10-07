import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { adminOnly, isAdminUser } from './access/roles'
import { rankerTranslations } from './admin/translations'
import { Categories } from './collections/Categories'
import { Entries } from './collections/Entries'
import { Items } from './collections/Items'
import { Lists } from './collections/Lists'
import { Media, MEDIA_MAX_FILE_SIZE } from './collections/Media'
import { Users } from './collections/Users'
import { categoryUrl } from './lib/url'
import { r2Storage } from './storage/r2'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' – Ranker.vn',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    // Không dùng Gravatar: tránh gửi mã băm email nhân sự sang dịch vụ bên ngoài.
    avatar: 'default',
    components: {
      // Font của design system cho toàn bộ admin (giao diện: src/app/(payload)/custom.scss).
      providers: ['@/admin/AdminFonts#AdminFonts'],
      graphics: { Logo: '@/admin/graphics/Logo#Logo', Icon: '@/admin/graphics/Icon#Icon' },
      // Menu bên trái theo design system (nền tối, nhãn Title Case).
      Nav: '@/admin/nav/Nav#Nav',
      // Dashboard: số liệu, việc cần xử lý, hoạt động gần đây (src/admin/dashboard).
      beforeDashboard: ['@/admin/dashboard/Dashboard#Dashboard'],
    },
  },
  // Nội dung đa ngôn ngữ: tiếng Việt là mặc định, tiếng Anh chưa dịch thì hiện bản tiếng Việt.
  // Slug và URL dùng chung một bộ (tiếng Việt); cách đặt URL tiếng Anh quyết định ở pass đa ngôn ngữ.
  localization: {
    locales: [
      { code: 'vi', label: 'Tiếng Việt' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'vi',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { vi },
    fallbackLanguage: 'vi',
    translations: rankerTranslations,
  },
  // Thứ tự menu: Bảng xếp hạng, Mục, Chuyên mục, Người dùng, Media (Suất tham gia ẩn khỏi menu).
  collections: [Lists, Items, Categories, Users, Media, Entries],
  upload: { limits: { fileSize: MEDIA_MAX_FILE_SIZE } },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: { disable: true },
  telemetry: false,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      // Một truy vấn chạy quá lâu bị hủy, không giữ chặt kết nối của Postgres dùng chung.
      statement_timeout: Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS || 30_000),
    },
    // Bảng nằm trong schema riêng `ranker`: REST API tự sinh của Supabase chỉ phục vụ schema
    // `public`, nên không với tới dữ liệu của Ranker (kể cả bảng users).
    schemaName: 'ranker',
    // Mọi thay đổi schema đi qua migration, kể cả ở dev (không dùng push).
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    r2Storage(),
    nestedDocsPlugin({
      collections: ['categories'],
      generateLabel: (_, doc) => String(doc.name ?? ''),
      // Nhóm lớn: /info; chuyên mục và chuyên mục con không chứa nhóm: /phim-series/phim-viet.
      generateURL: (docs) =>
        categoryUrl(
          (docs.length === 1 ? docs : docs.slice(1)).map((doc) => String(doc.slug)).join('/'),
        ),
    }),
    redirectsPlugin({
      collections: ['lists', 'items', 'categories'],
      overrides: {
        labels: { singular: 'Redirect', plural: 'Redirect' },
        access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
        admin: {
          group: 'Hệ thống',
          hidden: ({ user }) => !isAdminUser(user),
          description: 'Redirect 301 tự tạo khi URL công khai của nội dung đã đăng thay đổi.',
        },
      },
    }),
    // SEO field được gắn thủ công vào từng collection (tab SEO); plugin chỉ cung cấp nút tự sinh.
    seoPlugin({
      generateTitle: ({ doc }) => `${doc?.title ?? doc?.name ?? ''} | Ranker.vn`,
      // Tóm tắt (mục) hoặc mô tả ngắn (chuyên mục); bỏ qua field rich text.
      generateDescription: ({ doc }) =>
        [doc?.summary, doc?.description].find((v): v is string => typeof v === 'string') ?? '',
    }),
  ],
})
