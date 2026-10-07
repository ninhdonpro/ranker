# Ranker.vn — Màn hình Chuyên mục kiểu WordPress (form thêm bên trái, cây bên phải)

Kế hoạch đã duyệt ngày 08/10/2026. Cập nhật file này khi kế hoạch thay đổi trong lúc làm (CLAUDE.md §10).

**Thay đổi 08/10/2026 (theo yêu cầu):** "Chỉnh sửa" mở **popup** (document drawer của Payload: sửa đầy đủ, gồm SEO, màu, icon, chuyển cha) thay vì chuyển sang trang sửa; "Sửa nhanh" vẫn sửa tại dòng. Đã làm ở S2. Mọi chỗ bên dưới ghi "trang Chỉnh sửa" nay hiểu là popup này.

**Thay đổi 08/10/2026 (lần 2):** thay vì hiện cả cây, mỗi chuyên mục có con có **nút mũi tên mở/đóng** (nhóm lớn mở sẵn, các tầng dưới thu gọn) + nút "Mở Tất Cả / Thu Gọn Tất Cả"; chỉ dòng đang hiện mới được vẽ. Lý do: danh sách có thể lên hàng trăm đến nghìn chuyên mục, phân trang không hợp với cây (con tách khỏi cha, kéo-thả không qua trang được). Server vẫn nạp toàn bộ một lần (5 trường nhẹ); **giới hạn:** nếu lên vài nghìn chuyên mục thì chuyển sang nạp con theo từng nhánh khi bấm mở. Ô tìm kiếm (S6) tự mở các nhánh có kết quả. Đồng thời thêm ở đầu trang admin: **cờ chọn ngôn ngữ** (thay ô "Ngôn ngữ: ..." mặc định) và **nút đổi sáng/tối**, xem `docs/design.md › admin-header-control`.

## Context

Màn hình Chuyên mục hiện là bảng danh sách mặc định của Payload: phân trang 10 dòng (63 chuyên mục → 7 trang), cột Tên / Chuyên mục cha / Đường dẫn / Ngày cập nhật, cây 3 tầng bị "phẳng hóa" nên khó nhìn. Nút thêm mới chỉ là chữ "Tạo Mới" nhỏ cạnh tiêu đề (có, nhưng dễ bỏ sót) và mở trang tạo đầy đủ nhiều tab (Nội dung/SEO/FAQ...) cho việc chỉ cần đặt một cái tên.

Mục tiêu (theo yêu cầu): bố cục như trang "Danh mục" của WordPress.
- **Trái:** form "Thêm chuyên mục" ngay trên trang.
- **Phải:** toàn bộ cây chuyên mục, con thụt lề dưới cha. Bỏ cột ngày cập nhật, đường dẫn, chuyên mục cha.
- Sửa nhanh tại dòng (tên + slug); trang sửa đầy đủ vẫn dùng cho mô tả, FAQ, SEO, màu, icon, chuyển cha.

**Quyết định đã chốt (hỏi đáp 08/10/2026):**
- Form thêm **giữ ô "Chuyên mục cha"** (để trống = nhóm lớn). Cột cha trong danh sách thì bỏ.
- **Làm luôn kéo-thả** đổi thứ tự trong cây.

## Kết quả khảo sát

- `src/collections/Categories/index.ts`: `orderable: true`, `delete: () => false` (xóa qua safe-delete), `create: adminOnly`, `update: staffOnly`, field `slug`/`parent`/`itemRoute` chỉ admin được sửa (`adminOnlyField`). `name` là field localized.
- **Mọi luật cây đã có ở server** (`placement.ts › resolvePlacement`, hook `beforeChange`): tối đa 3 tầng, chống vòng lặp, slug hợp lệ/không trùng URL/không trùng từ khóa dành riêng, nhóm lớn bắt buộc `itemRoute` và không đổi sau khi tạo, đổi slug của chuyên mục đã có URL **bắt buộc xác nhận** (`confirmUrlChange`) và tự tạo redirect 301 cho chuyên mục đó lẫn con cháu. Giao diện mới chỉ gọi REST API chuẩn của Payload nên **không viết lại luật nào, không đổi schema, không cần migration**.
- Có sẵn để tái dùng:
  - `POST /api/categories/url-preview` (`urlPreview.ts`): trả URL mới và số URL bị ảnh hưởng khi đổi slug → dùng cho cảnh báo trong "Sửa nhanh".
  - `SafeDeleteDialog` (`src/admin/SafeDeleteMenuItem.tsx`): hộp thoại gõ tên để xóa, đã nhận `collectionSlug`/`id` qua props → chỉ cần `export`.
  - `getCategoryIndex` (`src/admin/cells/data.ts`): nạp toàn bộ chuyên mục theo request và tính màu kế thừa từ cha.
  - `.rk-dot` + token `--rk-cat-*` (chấm màu chuyên mục).
  - `DraggableSortable` của `@payloadcms/ui` (đã kèm `@dnd-kit`, **không thêm thư viện**).
  - `categoryUrl()` (`src/lib/url.ts`) cho link "Xem".
- Kéo-thả: Payload tự có endpoint `POST /api/reorder` (`{collectionSlug, docsToMove:[id], newKeyWillBe, orderableFieldName:'_order', target:{id,key}}`); hàm `handleDragEnd` của Payload là mẫu chuẩn. `_order` là khóa phân số toàn cục, nên đổi chỗ giữa các anh em cùng cha vẫn đúng.
- Cách Payload cho thay màn hình danh sách: `admin.components.views.list.Component` (server component nhận `ListViewServerProps`: `payload`, `i18n`, `permissions`...). Plan admin-ui trước chỉ cấm override view *sửa*; override view *danh sách* của riêng Chuyên mục là phạm vi mới, cần bạn duyệt.
- Đánh đổi khi thay view: mất phân trang, bộ lọc, chọn nhiều dòng, chọn cột của Payload cho riêng Chuyên mục. Không ảnh hưởng thực tế: ~63 bản ghi (đã có comment "vài chục bản ghi" trong `data.ts`), xóa hàng loạt vốn bị tắt, và bù lại bằng ô tìm kiếm.
- Chưa có test nào cho màn hình danh sách; `tests/int/categories.int.test.ts` đã phủ luật cây và quyền.

## Thiết kế

**Bố cục** (`admin-split-layout`): hai cột, trái ~340px form, phải phần còn lại; dưới 900px xếp chồng (form trên). Tiêu đề trang Lora `h1` + dòng mô tả giữ nguyên.

**Form "Thêm chuyên mục" (chỉ Admin thấy; biên tập viên thấy danh sách rộng hết cỡ):**
- Tên (bắt buộc), Slug (để trống = tự sinh từ tên, có gợi ý), Chuyên mục cha (dropdown thụt lề theo tầng, chỉ liệt kê tầng 0–1; "Không có (nhóm lớn)"), Tiền tố URL của mục (chỉ hiện khi chọn "Không có"; `/review` hoặc `/wiki`).
- Nút "Thêm Chuyên Mục". Lỗi server (`errors[].message`) hiện ngay dưới ô tương ứng. Thành công: toast, xóa form (giữ nguyên cha vừa chọn để thêm liên tiếp), cây tải lại.
- Gọi `POST /api/categories?locale=<ngôn ngữ đang chọn>`. Màu, icon, mô tả, FAQ, SEO: dùng "Chỉnh sửa" sau khi tạo.

**Cây bên phải:**
- Chỉ **một cột Tên**: tay kéo ⋮⋮, chấm màu (`.rk-dot`, kế thừa màu cha), tên, thụt lề 0 / 24px / 48px theo tầng. Nhóm lớn chữ đậm hơn.
- Hàng thao tác dưới tên, **luôn hiện** (không chờ hover, vì người đọc có cả người lớn tuổi và dùng cảm ứng): `Chỉnh sửa | Sửa nhanh | Thêm con | Xóa | Xem`. Mức quyền: biên tập viên chỉ thấy Chỉnh sửa, Sửa nhanh (chỉ ô Tên), Xem; "Thêm con" và "Xóa" chỉ Admin.
- **Sửa nhanh** mở dòng sửa tại chỗ: Tên, Slug (khóa với biên tập viên), nút Cập Nhật / Hủy. Khi slug đổi: gọi `url-preview`, hiện "URL đổi từ /a thành /b, ảnh hưởng N URL, tạo redirect 301" kèm ô xác nhận; chưa tick thì không cho lưu (khớp luật server). Lưu bằng `PATCH /api/categories/:id?locale=...` (+`confirmUrlChange: true`).
- **Thêm con:** cuộn lên form và điền sẵn chuyên mục cha.
- **Kéo-thả:** chỉ đổi thứ tự giữa các chuyên mục **cùng cha** (đổi cha vẫn làm ở trang Chỉnh sửa, vì cần xác nhận URL). Cập nhật tức thì (optimistic) rồi gọi `/api/reorder`; lỗi thì hoàn lại và báo toast, giống hành vi mặc định của Payload. Tắt kéo-thả khi đang tìm kiếm.
- **Xóa:** mở lại hộp thoại gõ tên, xem ảnh hưởng (đã có).
- Tìm kiếm (client): lọc theo tên, giữ lại các dòng tổ tiên để còn nhìn ra cây.
- Trạng thái rỗng dùng `empty-state`.

**Dữ liệu:** server component nạp **toàn bộ** chuyên mục một lần (`limit: 0`, `sort: '_order'`, `select` name/slug/parent/level/path/color/_order), dựng cây bằng hàm thuần `buildCategoryTree` (có unit test). Client nhận cây đã dựng, sau mỗi thao tác gọi `router.refresh()` để đồng bộ server.

## Các bước

Mỗi bước: chạy đủ gates (`pnpm format:check`, `lint`, `typecheck`, `test`) → test tay trên trình duyệt (sáng + tối, desktop + 768px) → báo cáo → chờ xác nhận mới sang bước sau (CLAUDE.md §11).

**S1. Bổ sung spec vào `docs/design.md` + `docs/design.html` (chờ duyệt trước khi code UI)**
Thêm vào mục "Trang quản trị" (cả hai file trong cùng một commit):
- `admin-split-layout`: form trái 340px + nội dung phải, khoảng cách `lg`; dưới 900px xếp chồng.
- `tree-row`: hàng của `data-table` với thụt lề 24px mỗi tầng (tối đa 2 tầng thụt); tên nhóm lớn đậm; ảnh/dấu nhận biết là `category-dot`.
- `row-actions`: dòng liên kết chữ `body-sm`/`caption` dưới tên hàng, ngăn bằng "|", luôn hiện; "Xóa" màu `danger`; focus ring theo `focus`.
- `quick-edit-row`: hàng mở rộng nền `surface-alt` chứa `admin-input`, nút `button-primary` + `button-ghost` cỡ `button-sm`.
→ verify: design.html hiển thị đúng 4 pattern ở sáng/tối; hai file khớp nhau.

**S2. Cây chuyên mục (chỉ đọc) thay bảng mặc định**
- `src/lib/categoryTree.ts` (hàm thuần `buildCategoryTree`, an toàn khi dữ liệu mồ côi) + `tests/unit/categoryTree.test.ts` (thứ tự theo `_order`, thụt lề đúng tầng, con mồ côi không làm vỡ, rỗng).
- `src/admin/categories/CategoriesListView.tsx` (server) + `CategoryTree.tsx` (client, tạm chỉ hiển thị); khai báo `admin.components.views.list.Component` trong `Categories/index.ts`; `pnpm generate:importmap`.
- `src/app/(payload)/admin-theme/_categories.scss` (import trong `custom.scss`), chuỗi i18n mới vào `src/admin/translations.ts` (không viết cứng tiếng Việt trong component).
→ verify: `/admin/collections/categories` hiện cây đủ 63 mục không phân trang, thụt lề đúng, chấm màu đúng, đúng thứ tự cũ; link Chỉnh sửa/Xem mở đúng; thanh breadcrumb và menu trái vẫn bình thường.

**S3. Form "Thêm chuyên mục"**
- `CategoryAddForm.tsx` (client) theo đặc tả trên; dropdown cha dựng từ cây; ẩn với biên tập viên.
→ verify (Admin): thêm nhóm lớn (đủ tiền tố URL), chuyên mục, chuyên mục con; slug trùng/từ khóa dành riêng/tầng thứ 4 hiện lỗi tiếng Việt đúng ô; slug để trống tự sinh không dấu; (Biên tập viên): không thấy form.

**S4. Sửa nhanh + Thêm con**
- Hàng sửa tại chỗ, tích hợp `url-preview` và ô xác nhận đổi URL; "Thêm con" điền sẵn cha.
→ verify: đổi tên (locale vi, rồi en); đổi slug không tick → bị chặn, tick → lưu, redirect 301 tạo cho cả con cháu (kiểm ở Redirect); biên tập viên không sửa được slug.

**S5. Kéo-thả đổi thứ tự**
- `DraggableSortable` theo từng nhóm anh em; gọi `/api/reorder`, optimistic + hoàn lại khi lỗi.
→ verify: kéo đổi chỗ trong nhóm lớn / chuyên mục / con; tải lại vẫn giữ thứ tự; kéo qua cha khác không được; lỗi mạng hoàn lại và báo toast; bàn phím (dnd-kit) kéo được.

**S6. Xóa, tìm kiếm, hoàn thiện**
- Export `SafeDeleteDialog` để dùng trong cây; ô tìm kiếm; trạng thái rỗng; `CHANGELOG.md` (mục Trang quản trị); cập nhật `description` của collection cho khớp.
→ verify: xóa chuyên mục còn con/bảng/mục bị chặn như cũ, xóa chuyên mục rỗng gõ đúng tên mới xóa được; tìm "phim" hiện phim + tổ tiên; toàn bộ gates xanh.

## Gợi ý cải thiện

**Nên làm ngay (đã nằm trong các bước trên):** hàng thao tác luôn hiện (không hover); ô tìm kiếm; "Thêm con" ở từng dòng; giữ nguyên cha vừa chọn sau khi thêm để thêm liên tiếp.

**Để sau (chưa build):**
- Cột/phụ chú nhỏ "số bảng · số mục" trên mỗi dòng để biết chuyên mục nào còn trống.
- Kéo-thả đổi cha (cần xác nhận URL + kiểm tra 3 tầng).
- Thu gọn/mở rộng từng nhóm lớn khi cây dài hơn nữa.
- Thêm màu/icon ngay trong form thêm.

## Rủi ro và giới hạn

- Thay view danh sách = phải tự chịu trách nhiệm cho những gì view mặc định cho sẵn (đã liệt kê ở trên). Nếu sau này có hàng trăm chuyên mục, cần phân trang/thu gọn nhánh.
- Props server của view list và hành vi `DraggableSortable` ngoài ngữ cảnh form array cần xác nhận khi code (Payload 3.90.2). Nếu `DraggableSortable` không dùng được ngoài form, dùng thẳng `@dnd-kit/core`/`sortable` đã có sẵn dưới dạng phụ thuộc của `@payloadcms/ui` (nêu rõ trong báo cáo S5 trước khi thêm vào `package.json`, vì CLAUDE.md yêu cầu lý do khi thêm thư viện).
- Kéo-thả và sửa nhanh gọi API phía client rồi `router.refresh()`; không giữ trạng thái quan trọng ở bộ nhớ (an toàn khi chạy nhiều container).

**Thay đổi 08/10/2026 (lần 3, S3):** form thêm **không có ô "Tiền tố URL của mục"** và **bắt buộc chọn chuyên mục cha** (hai nhóm lớn là cố định, không tạo nhóm lớn từ form). Chuyên mục thêm vào "Sản phẩm & Dịch vụ" tự có `/review`, vào "Thông tin" tự có `/wiki` (server kế thừa từ nhóm lớn, đã có sẵn). Tạo nhóm lớn mới (nếu sau này cần) làm ở trang tạo đầy đủ.

**Tiến độ (08/10/2026):** S1–S6 đã làm xong. S4 Sửa nhanh + Thêm con, S5 kéo-thả (dùng `DraggableSortable` có sẵn của Payload, không thêm thư viện; gọi `/api/reorder`, cập nhật tạm rồi hoàn lại nếu lỗi), S6 xóa an toàn (dùng lại `SafeDeleteModal`) và tìm kiếm không dấu (giữ tổ tiên, tắt kéo-thả khi đang tìm). Kiểm tay: sửa nhanh có đổi slug (chặn lưu tới khi tick xác nhận), kéo bằng bàn phím và thứ tự lưu ở server, thêm con, tìm kiếm, xóa.
