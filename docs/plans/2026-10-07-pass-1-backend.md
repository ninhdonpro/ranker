# Ranker.vn — Pass 1: Nền tảng backend (Payload CMS + Lexical)

## Context

Repo hiện chỉ có design system (`docs/design.md`, `docs/design.html`) và prototype HTML tĩnh (`prototype/homepage.html`, `category.html`, `post.html` = trang bảng, `item.html`). Chưa có code ứng dụng. Pass này dựng nền backend để đội nội dung đăng nhập admin, tạo chuyên mục / mục / bảng / suất tham gia, soạn nội dung bằng Lexical và upload ảnh lên R2. Mô hình dữ liệu phải sẵn cho vote, xếp hạng, tài trợ, chia doanh thu, sửa kiểu Wikipedia và đa ngôn ngữ mà không phải đập lại.

**Hạ tầng (đã chốt, thay cho giả định Vercel):** Next.js + Payload tự host trên VPS, quản trị bằng Coolify, chạy trong Docker container như một server Node chạy lâu dài. Supabase (self-host) nằm cùng VPS, app kết nối thẳng Postgres qua mạng Docker nội bộ, pool nhỏ cố định, **một `DATABASE_URL`** dùng cho cả runtime, migration và seed. Dev: Postgres trong Docker local (Colima).

---

## 1. Kết quả khảo sát

### Repo
- Không có `package.json` hay code. `.gitignore` chỉ có `.DS_Store` và `__pycache__/`.
- `CLAUDE.md`: đã được anh/chị cập nhật (VPS/Coolify, mục "Triển khai (Coolify)") và kéo về worktree; mục 3 (lệnh) và mục 4 (bản đồ repo) đã điền sau B1, sẽ cập nhật tiếp ở mỗi bước có thêm lệnh/thư mục.
- Máy dev: Node 24.15, pnpm 11.23, Docker CLI + Colima (Colima hiện chưa chạy), chưa có psql.

### Phiên bản (kiểm tra trên npm ngày 07/10/2026)
| Gói | Khóa ở | Ghi chú |
|---|---|---|
| `payload`, `@payloadcms/*` (next, db-postgres, richtext-lexical, storage-s3, plugin-seo, plugin-redirects, plugin-nested-docs, translations) | **3.90.2** | Ra ngày 23/09, đã chạy 2 tuần. Peer: `next >=16.3.3 <17` |
| `next` | **16.3.8** | Bản vá mới nhất của nhánh 16.3, nằm trong peer range. Không dùng 16.4.0 vì mới ra ngày 06/10 |
| `react`, `react-dom` | **19.2.6** | Trùng với template chính thức của Payload 3.90.2 |
| `typescript` | 5.7.3 | Như template |
Mọi phiên bản khóa cứng (không dùng `^`). Next và Payload luôn được nâng cùng nhau.

### Design system dùng lại được cho admin
Token màu `warning`/`warning-soft` và `error`/`error-soft`, các pattern `alert-warning`, `modal`, `field-hint`/`field-error`, và quy tắc Title Case cho nhãn nút. Bộ màu `cat-*` dùng làm danh sách lựa chọn màu cho chuyên mục. **Thiếu** pattern "hộp thoại xác nhận nguy hiểm (gõ tên để xác nhận)": sẽ đề xuất bổ sung vào `design.md` khi làm Bước 7.

### Lexical và tính năng có sẵn của Payload (đã xác minh trong package 3.90.2)
- `LinkFeature({ enabledCollections })`: link nội bộ lưu tham chiếu `{relationTo, value: id}` nên đổi slug thì link vẫn đúng. Render qua `LinkJSXConverter({ internalDocToHref })`.
- `UploadFeature` (chèn ảnh từ Media), `BlocksFeature`, `HeadingFeature`, `OrderedList/UnorderedList`, `BlockquoteFeature`, `FixedToolbarFeature`, `InlineToolbarFeature`. Menu `/` có sẵn.
- `<RichText>` trong `@payloadcms/richtext-lexical/react` là Server Component, render phía server.
- Có `convertMarkdownToLexical` / `convertLexicalToMarkdown` / `editorConfigFactory`, nên **chuyển Markdown → Lexical là khả thi bằng API có sẵn**.
- Admin tiếng Việt: có `@payloadcms/translations/languages/vi`.
- Có sẵn: `slugField()`; field `join` với `orderable: true` (kéo-thả sắp thứ tự, đánh dấu experimental) và `admin.allowCreate`; `admin.group: false` (ẩn khỏi menu nhưng vẫn giữ route); `editMenuItems` (thêm mục vào menu "…" của tài liệu); `orderable` cho collection; `indexes` compound unique.
- ⚠️ **Hàm `slugify` mặc định của Payload làm hỏng tiếng Việt** (`"Phim Việt"` → `phim-vit`), nên phải tự viết slugify: chuẩn hóa NFD, bỏ dấu, đổi `đ` thành `d`.

### Dữ liệu cần hiển thị (từ 4 trang prototype)
| Trang | Dữ liệu (phần đánh dấu *tính sau* thuộc về vote/pass sau, không lưu trong pass này) |
|---|---|
| Homepage | Bảng nổi bật (tiêu đề, chuyên mục, ảnh ghép 3 item đầu); bảng mới đăng (ngày đăng, số mục); lưới chuyên mục theo 2 nhóm (tên, icon, màu, số bảng); chuyên mục được tài trợ (*sau*); thịnh hành / đang lên / vừa đổi hạng / chủ đề đề xuất (*tính sau*) |
| Category (`/phim-series`) | Breadcrumb Trang chủ › Thông tin › Phim & Series; icon, tên, nhóm, mô tả ngắn; chip chuyên mục con; danh sách bảng; phần giới thiệu dài + FAQ (FAQPage schema); SEO; thống kê (*tính sau*) |
| List (`post.html`) | Tiêu đề, slug, chuyên mục con; tác giả (byline), ngày cập nhật; **luật bình chọn** (câu ngắn); phần giới thiệu (rich text); ảnh bìa hoặc ảnh ghép; **danh từ đơn vị** ("120 *phim*", "38 *quán*"); các suất: hạng, item, **mô tả theo ngữ cảnh** ("Vì sao khán giả yêu thích"), fact của item (năm, đạo diễn, thể loại, thời lượng + fact tự do), gallery của item (ảnh + video YouTube, chú thích, nguồn ảnh); link affiliate kèm ghi chú, % tán thành, nhãn xu hướng, "Cũng đứng #2 trong…", bộ sưu tập bảng (*sau*) |
| Item (`/mat-biec`) | Tên + năm; chuyên mục; gallery; mô tả dài có h3; "Có mặt trong các bảng" (hạng/tổng); fact cho schema Movie (đạo diễn, diễn viên, thể loại, thời lượng, ngày phát hành); "Fan cũng thích", đánh giá sao, bình luận (*sau*) |

---

## 2. Kiến trúc đề xuất

### Cấu trúc repo (Next App Router + Payload trong cùng app)
```
src/
  app/(payload)/…            # admin + REST, sinh từ template blank của Payload
  app/(frontend)/…           # chỉ có trang kiểm tra tối giản, không style, gắn noindex
  proxy.ts                   # tra redirect 301 cho đường dẫn công khai (Next 16 proxy)
  collections/  Users, Media, Categories, Items, Lists, Entries
  fields/       slug (slugify tiếng Việt), createdBy/updatedBy, urlGuard, attributes blocks
  access/       isAdmin, isStaff, isAdminOrSelf, ...
  lib/url.ts    getDocUrl() — nguồn duy nhất sinh URL (dùng cho link nội bộ, redirect, SEO, sau này sitemap)
  lib/reserved.ts  danh sách từ khóa dành riêng
  lexical/      editorFull, editorCompact
  admin/        component custom (cảnh báo đổi URL, hộp thoại xóa có gõ tên)
  endpoints/    url-preview, safe-delete
  seed/
  migrations/
tests/ (vitest: unit + integration chạy Local API trên Postgres test)
docker-compose.yml (Postgres dev/test), Dockerfile (production)
```

### Người dùng và đăng nhập
- Đã chốt dùng **2 collection auth trong Payload**. Pass này chỉ làm `users` (nhân sự, `admin.user = 'users'`). Pass sau sẽ thêm `members` (người dùng công khai, đăng nhập Google qua custom strategy) và members không bao giờ vào được `/admin`. Trang người dùng công khai sẽ ở `/@username`.
- Trường của `users`: email/mật khẩu (có sẵn), `role` (admin | editor), `displayName`, `avatar`. Bật `maxLoginAttempts` và `lockTime`.

**Ranh giới quyền (đề xuất):**
| Hành động | Admin | Biên tập viên |
|---|---|---|
| Tạo/sửa/lưu nháp/đăng Bảng và Mục; thêm/sửa/sắp xếp/gỡ Suất | ✓ | ✓ |
| Upload và sửa Media | ✓ | ✓ |
| Sửa nội dung chuyên mục (mô tả, giới thiệu, FAQ, SEO) | ✓ | ✓ |
| Tạo, di chuyển, đổi slug, xóa chuyên mục | ✓ | ✗ |
| Xóa Bảng, Mục, Media | ✓ (có gõ tên xác nhận) | ✗ |
| Quản lý người dùng, đổi vai trò | ✓ (không xóa được admin cuối cùng) | Chỉ sửa tài khoản của chính mình; xem được danh sách nhân sự (chỉ đọc) |
| Xem và sửa Redirect | ✓ | ✗ |

### Mô hình dữ liệu
**`categories`** — một collection tự tham chiếu, tối đa 3 tầng: Nhóm › Chuyên mục › Chuyên mục con.
- Trường: `name`, `slug`, `parent`, `breadcrumbs` (plugin nested-docs), `path` (tính tự động, **unique ở DB**), `itemRoute` (chỉ dùng cho nhóm: `review` | `wiki`), `icon` (emoji), `color` (chọn trong `cat-*`), `description`, `about` (Lexical đầy đủ), `faq[]` (câu hỏi/trả lời), `meta` (SEO), `createdBy`/`updatedBy`. Collection `orderable` để kéo-thả thứ tự menu.
- 2 nhóm là bản ghi gốc: **Sản phẩm & Dịch vụ** (slug `product`, itemRoute `review`) và **Thông tin** (slug `info`, itemRoute `wiki`). Chỉ admin tạo được bản ghi ở tầng gốc.
- `path` không chứa nhóm: nhóm → `product`; chuyên mục → `phim-series`; chuyên mục con → `phim-series/phim-viet`. Tất cả nằm ở gốc URL.
- Validate: tối đa 3 tầng, chặn vòng lặp parent, **chặn chuyển sang nhóm khác**, không trùng từ khóa dành riêng (`list`, `review`, `wiki`, `product`, `info`, `admin`, `api`, `_next`, `media` và mọi slug bắt đầu bằng `@`; danh sách nằm trong `lib/reserved.ts` để dễ mở rộng).

**`items`** (Mục) — có nháp và lịch sử phiên bản.
- Trường: `name`, `slug` (unique trong toàn bộ item), `category` (bắt buộc, không được là nhóm), `url` (tính tự động: `/review/<slug>` hoặc `/wiki/<slug>`, tiền tố lấy từ `itemRoute` của nhóm gốc), `image`, `gallery[]` (ảnh từ Media hoặc video YouTube, kèm chú thích), `summary` (ngắn, dùng cho thẻ và mô tả SEO mặc định), `description` (Lexical đầy đủ), `attributes` (blocks, tối đa 1), `facts[]` (nhãn/giá trị), `meta`, `createdBy`/`updatedBy`, `appearsIn` (join chỉ đọc sang `entries`, cho biết item nằm trong những bảng nào).
- Block thuộc tính theo nhóm schema.org: **Sản phẩm** (hãng, model, giá tham khảo, ngày ra mắt), **Địa điểm/Quán** (địa chỉ, quận/huyện, tỉnh/thành, khoảng giá), **Tác phẩm** (loại phim/series/sách/bài hát, năm, đạo diễn/tác giả, diễn viên/nghệ sĩ, thể loại, thời lượng, ngày phát hành), **Người** (năm sinh, nghề nghiệp, quê quán), **Tổ chức** (năm thành lập, trụ sở, website). Chi tiết lẻ như "Doanh thu" hay "Pin" đi vào `facts`.
- Khi slug bị trùng: nếu slug tự sinh thì tự gắn hậu tố có nghĩa lấy từ thuộc tính (khu vực → `pho-thin-ha-noi`, năm → `mat-biec-2019`, năm sinh, hãng); nếu biên tập viên tự gõ slug thì báo lỗi kèm gợi ý. Chỉ dùng `-2` khi không có dữ liệu để làm hậu tố.

**`lists`** (Bảng xếp hạng) — có nháp và lịch sử phiên bản.
- Trường: `title`, `slug` (unique trong các bảng), `url` = `/list/<slug>`, `category` (không được là nhóm), `intro` (Lexical đầy đủ), `coverImage` (tùy chọn; khi trống thì dùng ảnh ghép từ các item đầu), `listType` (thường trực | sự kiện), `startsAt`/`endsAt` (chỉ hiện khi là sự kiện, kiểm tra ngày kết thúc sau ngày bắt đầu, chưa có logic), `rules` (luật bình chọn), `itemNoun` ("phim", "quán"…), `author` (byline, mặc định là người tạo), `rankingMode` (`manual` mặc định; `votes` dành cho pass vote), `meta`, `createdBy`/`updatedBy`, `entries` (join `orderable` + `allowCreate`, nằm trong tab "Các mục").

**`entries`** (Suất tham gia) — collection riêng, ẩn khỏi menu (`admin.group: false`), quản lý ngay trong màn hình sửa bảng.
- Trường: `list`, `item` (relationship có `allowCreate`, nên tạo được item mới ngay trong drawer), `blurb` (Lexical gọn: đoạn văn, đậm, nghiêng, link), `createdBy`/`updatedBy`. Thứ tự biên tập lưu bằng field fractional-index của join orderable.
- **Unique index (list, item)** ở DB, kèm hook trả thông báo tiếng Việt dễ hiểu ("Mục này đã có trong bảng").
- Sau này vote, điểm, hạng, xu hướng, tài trợ, affiliate và người đóng góp sẽ là các collection hoặc cột tham chiếu `entries.id`.
- Chuyển sang xếp hạng theo vote: mọi nơi đọc thứ hạng đi qua một hàm duy nhất `getRankedEntries(list)`. Hàm sắp theo `_order` khi `rankingMode = manual`, và theo điểm vote (thứ tự biên tập làm tiêu chí phụ) khi chuyển sang `votes`. Không phải đổi mô hình dữ liệu.

**`media`**: `alt` bắt buộc (có validate độ dài tối thiểu và không được trùng tên file), `caption`, `credit` (nguồn ảnh, ứng với `photo-credit` trong design system), `focalPoint`. Ảnh tự chuyển sang webp, có các size: thumb 176px, card 16:9, og 1200×630. Chỉ nhận jpeg/png/webp/avif, có giới hạn dung lượng. Lưu bằng `@payloadcms/storage-s3` trỏ tới **R2** (`region: auto`, endpoint R2); URL công khai lấy từ domain public của R2 (`disablePayloadAccessControl`) để ảnh đi qua CDN Cloudflare chứ không đi qua Node.

**`redirects`** (plugin-redirects, chỉ admin thấy, nằm trong nhóm "Hệ thống" cuối menu): `from` là đường dẫn cũ, `to` là **tham chiếu tới tài liệu** (lists | items | categories), nên URL đích luôn được tính lại tại thời điểm truy cập và không bao giờ tạo chuỗi redirect.

**`createdBy` / `updatedBy`**: field factory dùng chung, hook gán từ `req.user`, khóa không cho sửa qua API, hiển thị chỉ đọc ở sidebar. Gắn cho lists, items, entries, categories, media.

### Cơ chế URL, slug và redirect (dùng chung cho 3 collection)
1. Slug tự sinh từ tên/tiêu đề qua `slugField({ slugify: vnSlugify })`, sửa tay được.
2. Trường `url`/`path` được tính trong `beforeChange` và là nguồn duy nhất cho mọi URL.
3. Khi URL đã đăng của tài liệu thay đổi (đổi slug; item đổi chuyên mục sang nhóm khác; chuyên mục đổi slug hoặc đổi cha), `afterChange` tạo redirect 301 từ URL cũ tới tài liệu. Hook chỉ chạy khi publish, không chạy khi lưu nháp. Khi một chuyên mục đổi, plugin nested-docs lưu lại các chuyên mục con, hook của từng con tự tạo redirect cho con đó, nên **toàn bộ cây con đều có redirect**. Đồng thời hook xóa các redirect có `from` trùng với URL mới để không tạo vòng lặp.
4. **Bảo vệ trước khi lưu**: component `UrlChangeGuard` đặt cạnh ô slug (và cạnh ô chuyên mục/cha). Component gọi endpoint `url-preview` để lấy URL cũ, URL mới và số URL bị ảnh hưởng, rồi hiện cảnh báo kiểu `alert-warning` kèm ô tick "Tôi xác nhận đổi URL". Server cũng chặn: nếu tài liệu đã đăng bị đổi URL mà chưa tick xác nhận thì báo lỗi validation, nên gọi qua API cũng không lách được.
5. Mã 301 thật: `proxy.ts` (chạy Node runtime trên server tự host) tra bảng redirects cho các đường dẫn công khai, có cache LRU ngắn hạn, rồi trả 301. (Hàm `permanentRedirect()` của Next trả 308, không đúng yêu cầu.)

### Trình soạn thảo
- **Đầy đủ** (giới thiệu bảng, mô tả item, giới thiệu chuyên mục): đoạn văn, H2/H3 (H1 dành cho tiêu đề trang), đậm, nghiêng, danh sách có thứ tự / không thứ tự, trích dẫn, link (nội bộ tới lists/items/categories; link ngoài có tùy chọn `nofollow`/`sponsored`), chèn ảnh từ Media (có chú thích), menu `/`, toolbar cố định và toolbar nổi.
- **Tắt**: gạch chân (dễ nhầm với link), gạch ngang, chỉ số trên/dưới, inline code, căn lề, thụt lề, checklist, bảng, relationship block. Lý do: giữ nội dung gọn và đồng nhất với design system.
- **Gọn** (mô tả suất): đoạn văn, đậm, nghiêng, link.
- Chỉ lưu JSON Lexical. Trang công khai render bằng `<RichText>` phía server; `internalDocToHref` đọc trường `url` của tài liệu được tham chiếu.

### SEO
`plugin-seo` thêm nhóm `meta` (title, description, image) cho categories, items, lists, kèm nút tự sinh và khung xem trước. Nếu để trống thì dùng giá trị mặc định tính lúc render bằng `getSeoMeta(doc)`: tiêu đề là `{tên} | Ranker.vn`, mô tả là `summary`/`description` hoặc ~155 ký tự đầu của intro (chuyển plaintext). Không ghi giá trị mặc định vào DB, để mặc định luôn theo nội dung mới nhất.

### Admin
Giao diện `vi` (`supportedLanguages: { vi }`); nhãn collection và field viết tiếng Việt; chuỗi trong component custom đi qua `i18n.translations` của Payload. Thứ tự menu: Bảng xếp hạng, Mục, Chuyên mục, Người dùng, Media (sau đó là nhóm "Hệ thống" chứa Redirect, chỉ admin thấy).

### An toàn khi xóa
- Quyền `delete` mặc định đặt bằng `false` cho lists, items, categories, nên nút Xóa có sẵn và chức năng xóa hàng loạt bị ẩn.
- Thay bằng mục "Xóa…" trong `editMenuItems` (chỉ admin thấy). Mục này mở modal: liệt kê ảnh hưởng (item: các bảng đang chứa nó; bảng: số suất; chuyên mục: số chuyên mục con, bảng, item), bắt **gõ đúng tên** rồi mới gọi endpoint `safe-delete`. Server kiểm tra lại vai trò, kiểm tra tên khớp, kiểm tra ràng buộc, rồi mới xóa.
- Xóa bảng hoặc item thì xóa luôn các suất liên quan (đã hiện trong danh sách ảnh hưởng).
- **Chuyên mục còn chuyên mục con hoặc còn bảng/item: chặn xóa**, hiện số lượng và link tới từng nhóm để admin chuyển nội dung đi trước. Công cụ "chuyển tất cả sang chuyên mục khác" để pass sau.

### Trang kiểm tra (không style, `noindex`)
Đặt ở đúng các mẫu URL thật: `/list/[slug]`, `/review/[slug]`, `/wiki/[slug]`, `/[...path]` (chuyên mục). Mỗi trang chỉ render tiêu đề, nội dung Lexical và danh sách suất theo `getRankedEntries`, phục vụ kiểm tra SSR, link nội bộ và 301. Pass dựng trang công khai sẽ thay các trang này. Toàn bộ staging gắn `X-Robots-Tag: noindex`.

### Đánh giá (e) log 404 → **để pass dựng trang công khai**
Lý do: trước khi có trang thật thì chưa có traffic hay URL nào có thể lọt lưới; logic resolver hoàn chỉnh cũng sẽ được viết ở pass đó; và việc ghi log 404 cần thiết kế chống ghi tràn (bot quét `wp-admin`, `.php`…): upsert theo path, đếm số lần, bỏ qua các pattern rác, giới hạn tần suất. Pass này đã có sẵn mọi thứ cần cho bước tiếp theo (bảng redirects, `proxy.ts`, `getDocUrl`). Thiết kế dự kiến: collection `notFoundLogs` (path, hits, lastSeen, referrer) kèm nút "Tạo redirect" ngay trong admin.

---

## 3. Các bước (mỗi bước: chạy đủ gates → test tay trên trình duyệt → báo cáo → chờ anh/chị xác nhận)

Gates sau mỗi bước: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Test integration chạy Local API của Payload trên DB test trong Docker. Khi thay đổi schema: tạo migration và chạy `payload generate:types`.

**B0. Chuẩn bị (anh/chị làm, không có code)**
- Chạy `SELECT version();` trên Supabase VPS để biết major version Postgres.
- Tạo bucket R2 dev (và staging), API token (Access Key/Secret), domain public cho bucket.
- Bật Colima.
- Đồng ý commit `CLAUDE.md` vào repo.
→ verify: có đủ giá trị điền vào `.env.local`.

**B1. Khung dự án + Users/phân quyền**
Scaffold từ template blank của Payload (pnpm, TS strict), khóa phiên bản như mục 1, `docker-compose.yml` cho Postgres (cùng major version với VPS; DB dev và DB test riêng), adapter `@payloadcms/db-postgres` với pool nhỏ cố định, `.env.example`. Thêm các script `dev / build / start / format / format:check / lint / typecheck / test / generate:types / migrate:create / migrate / seed`. Thêm ESLint, Prettier, Vitest. Collection `users` (role, displayName, avatar, khóa đăng nhập sau nhiều lần sai), access helpers, admin `vi`.
→ verify: gates pass; `/admin` hiển thị tiếng Việt; tạo admin đầu tiên và đăng nhập được; admin tạo được tài khoản biên tập viên; biên tập viên đăng nhập được, không đổi được role của mình, không thấy hay sửa được user khác; test unit cho access helpers.

**B2. Media + R2**
Collection `media` (alt bắt buộc, caption, credit, focal point, webp, image sizes, giới hạn mime/dung lượng), storage-s3 trỏ tới R2, URL công khai.
→ verify: upload ảnh trong admin và thấy file trên R2, URL ảnh trỏ tới domain R2; bỏ trống alt thì bị chặn kèm thông báo tiếng Việt; các size được sinh ra; biên tập viên upload được nhưng không thấy nút xóa.

**B3. Chuyên mục + hạ tầng URL/redirect**
`vnSlugify`, `lib/reserved.ts`, `lib/url.ts`, factory `createdBy/updatedBy`, collection `categories` (nested-docs, `path` unique, 2 nhóm product/info với itemRoute, giới hạn 3 tầng, chống vòng lặp, chặn chuyển nhóm, từ khóa dành riêng, orderable), plugin-redirects (chỉ admin), hook tạo redirect khi URL đổi (áp dụng cho cả cây con, dọn vòng lặp), `UrlChangeGuard` + endpoint `url-preview` + chặn phía server khi chưa xác nhận.
Test: slugify ("Phim Việt Hay Nhất Mọi Thời Đại" → `phim-viet-hay-nhat-moi-thoi-dai`, "Đà Lạt" → `da-lat`, "Ẩm thực" → `am-thuc`); từ khóa dành riêng; giới hạn tầng; vòng lặp; chặn chuyển nhóm; **(b) đổi slug hoặc đổi cha của chuyên mục có con thì tạo đủ redirect cho chính nó và toàn bộ con cháu, số URL bị ảnh hưởng tính đúng**; đổi rồi đổi ngược lại thì không còn vòng lặp redirect.
→ verify trình duyệt: tạo nhóm, chuyên mục, chuyên mục con, thấy path đúng; biên tập viên không tạo/di chuyển được chuyên mục; đổi slug chuyên mục cha thì thấy cảnh báo "ảnh hưởng N URL", chưa tick xác nhận thì không lưu được, tick rồi thì redirect xuất hiện trong admin; chuyển sang nhóm khác bị chặn; slug `list` hoặc `admin` bị chặn.

**B4. Mục (Items)**
Đủ các field ở mục 2, blocks thuộc tính + facts + gallery, URL `/review` hoặc `/wiki` theo nhóm, slug unique kèm gợi ý hậu tố có nghĩa, nháp và phiên bản, SEO với giá trị mặc định, editor đầy đủ (bản đầu).
Test: tiền tố URL đúng theo nhóm; đổi chuyên mục sang nhóm khác thì có redirect 301 `/review/x` → `/wiki/x`; slug trùng thì có gợi ý `-ha-noi`/`-2019`; kiểm tra unique tính cả bản nháp.
→ verify trình duyệt: tạo item có ảnh, mô tả, block Tác phẩm và facts; lưu nháp, đăng, xem lịch sử phiên bản và khôi phục một phiên bản; slug tiếng Việt có dấu được sinh đúng; đổi slug item đã đăng thì có cảnh báo.

**B5. Bảng xếp hạng + Suất tham gia**
Collection `lists` và `entries`; join `entries` (orderable, allowCreate) trong tab "Các mục"; trong drawer có thể chọn item có sẵn hoặc tạo item mới; unique (list, item); `appearsIn` trên item; `rankingMode`; loại bảng và thời hạn; `rules`, `itemNoun`, `author`; `getRankedEntries()`.
Test: thêm trùng item vào cùng bảng thì bị chặn với thông báo tiếng Việt; `createdBy` được ghi cho bảng, item và suất; thứ tự lưu đúng sau khi kéo-thả (gọi qua API); ngày kết thúc trước ngày bắt đầu thì bị chặn.
→ verify trình duyệt: tạo bảng, thêm item có sẵn, tạo item mới ngay trong drawer, viết mô tả theo ngữ cảnh, kéo-thả sắp thứ tự rồi tải lại trang vẫn giữ; thêm trùng thì bị chặn; mở item thì thấy danh sách bảng chứa nó; lưu nháp, đăng, xem lịch sử phiên bản của bảng.

**B6. Editor hoàn chỉnh + render SSR + 301**
Chốt cấu hình `editorFull` và `editorCompact`, link nội bộ, chèn ảnh; các trang kiểm tra; `proxy.ts` trả 301 (**làm spike trước** để xác nhận proxy dùng được Local API/DB trên Node runtime; nếu không được thì báo lại và đề xuất phương án khác, không tự lách). Chứng minh Markdown → Lexical bằng test: Markdown có heading, list, link được `convertMarkdownToLexical` chuyển thành JSON hợp lệ và render ra HTML đúng.
→ verify: xem source HTML của `/list/<slug>` thấy nội dung giới thiệu và danh sách suất; link nội bộ trong mô tả item vẫn đúng sau khi đổi slug item đích; `curl -I` URL cũ trả `301` kèm `Location` mới; menu `/` và chèn ảnh hoạt động trong editor.

**B7. An toàn khi xóa**
Đặt delete mặc định bằng false; mục "Xóa…" trong `editMenuItems` + modal gõ tên + endpoint `safe-delete`; danh sách bảng bị ảnh hưởng khi xóa item; chặn xóa chuyên mục còn con hoặc còn nội dung; xóa cascade các suất. Đề xuất bổ sung pattern "hộp thoại xác nhận nguy hiểm" vào `design.md` và `design.html`.
Test: gõ sai tên thì bị từ chối; biên tập viên gọi endpoint bị 403; chuyên mục có con bị chặn; xóa item thì các suất của nó biến mất.
→ verify trình duyệt: luồng gõ tên để xóa cho bảng, item, chuyên mục; xóa item đang nằm trong bảng thì thấy danh sách bảng bị ảnh hưởng; biên tập viên không thấy mục Xóa.

**B8. Seed dữ liệu mẫu**
`pnpm seed`: chỉ chạy được ở môi trường dev (từ chối khi `NODE_ENV=production`), chạy lại được nhiều lần. Seed tạo: 2 nhóm + 10 chuyên mục + chuyên mục con lấy từ `CATS` trong `prototype/assets/ranker.js`; 19 phim trong `post.html` (đủ thuộc tính); item Mắt Biếc với mô tả đầy đủ trong `item.html`; các item và bảng trên homepage/category (điện thoại, quán phở, ngân hàng, bãi biển…); bảng "Phim Việt Hay Nhất Mọi Thời Đại" với 19 suất có mô tả theo ngữ cảnh. Nội dung rich text viết bằng Markdown rồi chuyển qua `convertMarkdownToLexical` (dùng luôn pipeline đã chứng minh ở B6). Có thêm tùy chọn `--with-images` để sinh ảnh placeholder và upload lên R2 dev. Tài khoản seed (admin/editor) lấy từ biến môi trường.
→ verify: admin hiện đủ dữ liệu; trang kiểm tra render bảng phim Việt; chạy seed lần hai không tạo bản ghi trùng.

**B9. Docker + staging trên Coolify**
Dockerfile multi-stage (`output: 'standalone'`, base `node:24-bookworm-slim` để sharp chạy ổn định), endpoint healthcheck, biến `NOINDEX` cho staging, tài liệu biến môi trường Coolify. Theo mục "Triển khai (Coolify)" trong CLAUDE.md:
- **Migration chạy trước khi app nhận traffic**: `instrumentation.ts` (`register()`) khởi tạo Payload ngay khi server bật, và `prodMigrations` chạy ở bước này. Healthcheck chỉ trả OK sau khi khởi tạo xong, nên Coolify chưa chuyển traffic sang container mới cho tới lúc đó. Nếu spike cho thấy `register()` không chặn được request thì chuyển sang lệnh migrate riêng chạy trước `node server.js` trong entrypoint.
- **Build không cần DB**: đã xác nhận ở B1 (`pnpm build` với DATABASE_URL không kết nối được vẫn pass). Từ đây mỗi bước đều giữ điều kiện này: trang nào đọc dữ liệu thì render động, không prerender lúc build.
- **Không lưu gì trên ổ đĩa container**: media lên R2 (`disableLocalStorage`), không có thư mục `/media` trong image.
- **Nhiều container**: cache redirect của `proxy.ts` chỉ là cache TTL ngắn, không phải dữ liệu gốc; cache ISR và `revalidatePath` của Next chỉ đúng trong một container, nên ghi rõ giới hạn này trong CLAUDE.md và chỉ chạy 1 replica cho tới khi có cache handler dùng chung.

Anh/chị tạo app trên Coolify (tôi hướng dẫn từng bước), rồi cập nhật `CHANGELOG.md`.
→ verify: build image chạy được local; trên staging chạy lại **toàn bộ checklist test tay của pass** (đăng nhập theo từng vai trò, chuyên mục cha/con, item có ảnh R2 + editor có ảnh và link nội bộ + thuộc tính, bảng + suất + tạo item tại chỗ + sắp thứ tự, chặn trùng, danh sách bảng trên item, nháp/đăng/phiên bản, slug tiếng Việt + cảnh báo đổi slug, xóa có gõ tên, source HTML có nội dung, 301); deploy lại thì migration chạy trước khi container mới nhận request.

---

## 4. Quyết định đã chốt
- Đăng nhập: 2 collection auth trong Payload (`users` ngay bây giờ, `members` ở pass sau).
- Hạ tầng: VPS + Coolify + Docker, Node chạy lâu dài; Postgres kết nối trực tiếp qua mạng nội bộ, pool nhỏ cố định, một URL.
- Suất tham gia: collection `entries` + join field.
- Thông tin riêng theo loại: blocks theo nhóm schema.org + `facts` tự do.
- URL: `/list/[slug]`; `/review/[slug]` (nhóm Sản phẩm & Dịch vụ) hoặc `/wiki/[slug]` (nhóm Thông tin); `/@username` (sau); chuyên mục ở gốc, không chứa nhóm; trang nhóm `/product` và `/info`.
- Đổi slug hoặc đổi nhóm của nội dung đã đăng: cảnh báo, xác nhận, rồi tự tạo 301.
- Chuyên mục: một collection tự tham chiếu 3 tầng, chống vòng lặp, chặn chuyển nhóm.
- DB dev: Postgres trong Docker local. Có deploy staging ở bước cuối.

**Đã xác nhận (B0):** Supabase trên VPS dùng image `supabase/postgres:15.8.1.085` → Postgres **15**, khớp với Postgres dev (`POSTGRES_VERSION=15`).

---

## 5. Rủi ro và điểm cần lưu ý
- **Join `orderable` đang là experimental.** Đã khóa phiên bản và có test thứ tự; nếu có lỗi thì chuyển sang trường số `editorialOrder` (không đổi khái niệm dữ liệu).
- **Suất không đi theo nháp của bảng:** thêm hoặc sửa suất trong một bảng đã đăng có hiệu lực ngay. Cần báo cho đội nội dung; pass đề xuất sửa nội dung có thể thêm trạng thái cho từng suất.
- **Nháp và redirect:** redirect chỉ tạo khi publish; slug của bản nháp vẫn phải được kiểm tra trùng (truy vấn có tính cả bản nháp). Có test riêng.
- **`proxy.ts` trả 301** phụ thuộc vào việc dùng được DB trên Node runtime, nên làm spike ở đầu B6.
- **Tự host:** cache ISR nằm trên filesystem của container và mất khi deploy lại (chấp nhận được). Revalidate và cache redirect trong bộ nhớ chỉ đúng với một container; nếu chạy nhiều hơn 1 replica thì cần cache handler dùng chung. Pass này chỉ chạy 1 replica và ghi rõ giới hạn trong CLAUDE.md.
- **Xóa cascade suất** sẽ làm mất dữ liệu người đóng góp của suất đó. Chấp nhận được khi chưa có vote; xem đề xuất thùng rác ở mục 6.
- **Phụ thuộc bên ngoài:** cần khóa R2 và domain public trước B2.
- Payload và Next luôn nâng cùng nhau, theo peer range của `@payloadcms/next`.

---

## 6. Suggest improvements (chỉ đề xuất, chưa build khi chưa được duyệt)

**Nên làm ngay (chi phí thấp, làm sau sẽ đắt):**
1. **Bật lịch sử phiên bản (không có nháp) cho `entries`.** Kết hợp với `updatedBy`, mỗi phiên bản ghi lại ai sửa gì. Dữ liệu này cần cho chia doanh thu và **không thể bổ sung ngược** sau này.
2. **Autosave cho nháp** của Bảng và Mục: biên tập viên không mất bài khi đóng tab. Chỉ là thay đổi cấu hình.
3. **Admin không hiện nút xóa Media đang được dùng**, kèm cảnh báo khi ảnh còn được tham chiếu (tránh ảnh vỡ trên trang đã index).
4. **Index DB** cho `entries.item`, `items.category`, `lists.category`, `lists.publishedAt`. Truy vấn trang chủ và chuyên mục sau này cần, và thêm từ đầu thì rẻ.
5. **Statement timeout và giới hạn pool** cấu hình bằng biến môi trường, để một truy vấn chậm không giữ hết kết nối của Supabase dùng chung VPS.

**Để pass sau:**
- Log 404 kèm nút "Tạo redirect" (đánh giá ở mục 2).
- Nút Xem trước bản nháp từ admin (draft mode / live preview), làm cùng trang công khai thật.
- Thùng rác (soft delete) cho bảng, item, suất, kèm partial unique index; 410 cho nội dung đã xóa.
- Bảng sửa suất inline tự viết (nếu thao tác qua drawer bị chậm); thêm nhiều item vào bảng một lần (dán danh sách tên).
- Cảnh báo item có thể trùng khi tạo mới (dùng pattern `alert-warning` có sẵn).
- Block Lexical mới: video YouTube, callout `info-card`, thẻ nhúng item, bảng thông số.
- Bộ sưu tập bảng (rail "Bộ sưu tập" trong `post.html`), "Fan cũng thích", bảng liên quan.
- Collection tài trợ và affiliate tham chiếu `entries`; sổ ghi đóng góp (contributions ledger) khi thiết kế chia doanh thu.
- Công cụ chuyển hàng loạt nội dung giữa các chuyên mục; nhật ký thao tác của admin.
- Dùng Payload Jobs Queue (chạy được nhờ server Node lâu dài) để tổng hợp vote và tính xu hướng định kỳ.

---

## 7. File quan trọng
- Đầu vào: `docs/design.md`, `prototype/post.html` (FILMS), `prototype/item.html`, `prototype/category.html` (LISTS), `prototype/assets/ranker.js` (CATS), `CLAUDE.md` (ở checkout chính).
- Tạo mới: `src/payload.config.ts`, `src/collections/*`, `src/lib/{url,reserved,slug}.ts`, `src/lexical/*`, `src/admin/*`, `src/endpoints/*`, `src/proxy.ts`, `src/seed/*`, `src/migrations/*`, `docker-compose.yml`, `Dockerfile`, `.env.example`, `CHANGELOG.md`.

---

## 8. Nhật ký thay đổi kế hoạch

- **07/10/2026**: B1 hoàn thành. `CLAUDE.md` đã có mục "Triển khai (Coolify)", nên B9 được sửa: migration chạy trước khi nhận traffic, build không cần DB (đã kiểm chứng ở B1), ghi rõ giới hạn khi chạy nhiều container.
- **07/10/2026**: Làm **B3 trước B2** vì B2 cần thông tin R2 chưa có. B3 không phụ thuộc Media. B2 sẽ làm ngay khi có thông tin R2, trước B4 (Mục cần ảnh).
- **07/10/2026**: B3 hoàn thành. Phát sinh khi làm: field ảo `confirmUrlChange` bị Payload bỏ khỏi `data` trước `beforeChange`, nên xác nhận được ghi vào `context` ở `beforeValidate`; plugin redirects chưa có bản tiếng Việt nên tự bổ sung; `SlugField` của Payload không tôn trọng quyền sửa nên bọc thêm `SlugFieldWithAccess`; danh sách "Chuyên mục cha" chỉ hiện chuyên mục cùng nhóm lớn.
- **07/10/2026**: Xác nhận Postgres trên VPS là 15 (`supabase/postgres:15.8.1.085`), không cần đổi môi trường dev.
- **07/10/2026**: B2 hoàn thành. Bucket R2 hiện có là `ranker` (domain `media.ranker.vn`), dùng chung với production, nên thêm biến `R2_PREFIX` để file dev nằm trong `dev/`. Storage R2 tắt khi `NODE_ENV=test` (test không ghi vào bucket thật). Avatar admin dùng ảnh mặc định thay cho Gravatar (không gửi mã băm email nhân sự ra ngoài). Editor đầy đủ đã bật chèn ảnh từ Media.
- **07/10/2026**: Đổi tên khái niệm Item từ "Hồ sơ" thành **"Mục"** (theo yêu cầu), cập nhật cả CLAUDE.md mục 5. "Suất tham gia" giữ nguyên tên. Biên tập viên được xem danh sách nhân sự ở chế độ chỉ đọc (để hiện đúng tên người tạo và tác giả); tạo, sửa, đổi vai trò vẫn chỉ admin.
- **07/10/2026**: B4 hoàn thành. Phát sinh khi làm: (1) mỗi lời gọi Local API kèm `req` thay `req.context` bằng bản sao, nên hook luôn đọc/ghi trạng thái qua `req.context`; (2) với mục có bản nháp, redirect được tạo khi **đăng**, so với URL của bản đã đăng (không phải bản nháp gần nhất); (3) **khôi phục phiên bản cũ chỉ khôi phục nội dung, giữ nguyên URL đang công khai** (trước đó thao tác khôi phục bị cơ chế bảo vệ URL chặn mà không báo lỗi rõ). Các field `appearsIn` (danh sách bảng chứa mục) sẽ thêm ở B5 cùng collection Suất tham gia.
- **07/10/2026**: B5 hoàn thành. Nút "Xuất bản tài liệu" đổi thành **"Đăng"** (trạng thái "Đã đăng"/"Chưa đăng"). Suất tham gia **không đổi được mục hoặc bảng sau khi tạo** (vote và đóng góp sau này gắn vào suất; muốn đổi thì gỡ suất và thêm suất mới). Thứ tự kéo-thả lưu ở field `_entries_entries_order` (fractional index base-36, sắp đúng cả với collation `en_US.UTF-8`). Cơ chế URL cho collection có nháp tách thành `src/hooks/publishedUrl.ts`, dùng chung cho Mục và Bảng.
- **07/10/2026**: Theo quyết định mới, **bật hạ tầng đa ngôn ngữ ngay trong Pass 1** (thay cho "để pass sau"): localization của Payload với `vi` mặc định và `en`, bản `en` chưa dịch thì dùng bản `vi`. Field có bản dịch riêng: tên/tiêu đề, tóm tắt, mô tả, giới thiệu, FAQ, thông tin thêm, luật bình chọn, danh từ đơn vị, mô tả suất, chú thích, alt text, SEO. Slug, URL, thông tin riêng theo loại và nguồn ảnh dùng chung. **Chưa dịch nội dung, chưa làm trang tiếng Anh**; cách đặt URL tiếng Anh (`/en/...` hay domain riêng) quyết định ở pass đa ngôn ngữ. DB dev được dựng lại từ migration vì migration chuyển nội dung sang các bảng `_locales`.
- **07/10/2026**: B6 hoàn thành. Spike `proxy.ts` thành công: proxy chạy Node runtime và dùng được Payload Local API, cả ở dev lẫn bản production build; không cần phương án dự phòng. Thêm `skipTrailingSlashRedirect` để proxy gộp việc bỏ dấu `/` cuối URL với redirect thành **một bước 301** (trước đó Next trả 308 rồi mới 301). Link ngoài trong editor có thêm thuộc tính `rel` (sponsored, nofollow). `getRankedEntries` có tùy chọn bỏ mục chưa đăng và đánh lại số hạng. Đã đo trên bản production: proxy và phần render dùng chung một Payload instance (chung pool kết nối, do Payload lưu instance ở `global._payload`), nên mỗi container dùng tối đa `DATABASE_POOL_MAX` kết nối.
- **07/10/2026**: B7 hoàn thành. Nút xóa mặc định (từng tài liệu và hàng loạt) bị tắt cho Bảng, Mục, Chuyên mục, kể cả admin; thay bằng "Xóa…" trong menu ⋮ (chỉ admin thấy), hộp thoại hiện ảnh hưởng và chỉ cho xóa khi gõ đúng tên (tên tiếng Việt). Server kiểm tra lại quyền, tên, ràng buộc và xóa trong một transaction; xóa mục/bảng thì gỡ suất liên quan và xóa redirect trỏ tới tài liệu. Chuyên mục còn chuyên mục con, bảng hoặc mục thì chặn xóa. Hộp thoại dùng lại khung `confirmation-modal` của Payload; nút xóa dùng màu `error` (đề xuất `button-danger` cho design.md, chờ duyệt).
- **07/10/2026**: Bổ sung `button-danger` và pattern "Xác nhận nguy hiểm" vào `docs/design.md` và `docs/design.html` (đã duyệt). B8 hoàn thành: `pnpm seed` tạo 63 chuyên mục, 47 mục, 27 bảng từ prototype (bảng Phim Việt đủ 20 phim, Mắt Biếc có mô tả đầy đủ chuyển từ Markdown), chạy lại nhiều lần không trùng. Tùy chọn ảnh dùng script riêng `pnpm seed:images` (biến `SEED_WITH_IMAGES`) vì `payload run` bỏ các cờ `--...` và chỉ import file mà không chờ, nên file seed dùng top-level await.
- **07/10/2026**: B9 (phần chuẩn bị) hoàn thành. Quyết định mới: **không tạo database/user riêng**, dùng database `postgres` của Supabase nhưng **toàn bộ bảng nằm trong schema riêng `ranker`** (`schemaName` của Payload) để REST API tự sinh của Supabase (chỉ phục vụ schema `public`, cấp quyền mặc định cho `anon`) không với tới dữ liệu. Vì production chưa có dữ liệu, 6 migration cũ được gộp thành một migration gốc sinh lại bằng Payload; migration gốc có thêm `CREATE SCHEMA IF NOT EXISTS "ranker"` vì Payload không tự tạo schema. Build image trên VPS (≥ 8 GB RAM); bước build Next cần hơn 2 GB RAM (đã gặp OOM ở máy ảo 2 GB). Đã chạy thử image production ở local với DB trống: migration tự chạy lúc khởi động, healthy sau khoảng 8 giây, upload ảnh lên R2 hoạt động, `robots.txt` và `X-Robots-Tag` chặn index khi `NOINDEX=true`, khởi động lại không chạy lại migration. Hướng dẫn deploy: `docs/deploy-coolify.md`. Template Supabase của Coolify đang lỗi do image `minio/mc` không còn tồn tại: đã bỏ service `minio-createbucket` khỏi compose.
- **07/10/2026**: Làm thêm 3 đề xuất ở mục 6 (đã duyệt). (1) **Lịch sử phiên bản cho Suất tham gia** (không có nháp, tối đa 100 phiên bản/suất), mỗi phiên bản ghi `updatedBy`. (2) **Ngày đăng đầu tiên** (`publishedAt`, có chỉ mục) cho Mục và Bảng, ghi một lần ở lần đăng đầu, không sửa được qua API; migration điền ngày cho nội dung đã đăng từ phiên bản đã đăng sớm nhất. Chỉ mục cho `entries.item`, `items.category`, `lists.category` đã có sẵn. Thêm `statement_timeout` cho pool (biến `DATABASE_STATEMENT_TIMEOUT_MS`, mặc định 30 giây). (3) **Autosave** bản nháp mỗi 2 giây cho Mục và Bảng. Phát sinh: hook tự sinh slug của Payload ghi đè hậu tố chống trùng khi autosave, nên bỏ hook đó và gom việc sinh slug về `src/hooks/autoSlug.ts` với quy tắc: trước lần đăng đầu slug đi theo tên/tiêu đề; slug tự sửa tay thì giữ nguyên; từ lần đăng đầu slug cố định (đổi phải sửa tay và xác nhận đổi URL). Bản nháp được lưu khi còn trống tên, slug hoặc chuyên mục (autosave tạo nháp ngay khi mở màn hình tạo mới); thiếu gì thì báo khi bấm Đăng.
