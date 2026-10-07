# CLAUDE.md — Ranker.vn

File này áp dụng cho toàn bộ repository. Đọc kỹ trước khi lập kế hoạch hoặc viết code.

- Giao tiếp với tôi bằng tiếng Việt.
- Làm theo quy ước đã có trong codebase, ưu tiên bắt chước cách làm chuẩn ở những chỗ gần nhất.
- Chỉ dẫn trực tiếp của tôi trong phiên làm việc được ưu tiên hơn file này.
- Nếu một lệnh được ghi trong file này chạy lỗi, báo lại cho tôi, không tự chế cách lách.

---

## 1. Dự án

Ranker.vn là website xếp hạng mọi thứ cho người Việt: điện thoại, quán ăn, phim, ca sĩ, trường học... Thứ hạng do cộng đồng vote. **SEO là nguồn traffic chính.** Kiếm tiền từ quảng cáo, sponsored ranking, tài trợ chuyên mục, affiliate.

Giai đoạn hiện tại: **một ngôn ngữ (tiếng Việt).** Đa ngôn ngữ làm sau.

Roadmap: `[ĐIỀN ĐƯỜNG DẪN ranker-roadmap.md]`

## 2. Stack

- Next.js App Router, React, TypeScript, **tự host trên VPS, quản trị bằng Coolify** (app chạy trong Docker container như server Node lâu dài, không phải serverless; không dùng Vercel)
- Payload CMS cài bên trong ứng dụng Next.js
- Postgres (Supabase)
- Cloudflare R2 cho ảnh và media
- Trình soạn thảo: Lexical, editor có sẵn của Payload
- Thư viện i18n cho chữ trên giao diện

Next.js và Payload phải ở cặp phiên bản tương thích. Không tự nâng cấp một bên mà không kiểm tra bên kia.

## 3. Setup & lệnh

> Cập nhật mục này sau Pass 1, khi repo đã có script thật. Từ đó trở đi, mục này là nguồn chuẩn cho lệnh.

| Lệnh | Mục đích |
| --- | --- |
| `[ĐIỀN]` | Chạy môi trường dev |
| `[ĐIỀN]` | Build |
| `[ĐIỀN]` | Format |
| `[ĐIỀN]` | Lint |
| `[ĐIỀN]` | Type-check |
| `[ĐIỀN]` | Test |
| `[ĐIỀN]` | Sinh type và migration của Payload |
| `[ĐIỀN]` | Seed dữ liệu mẫu |

Biến môi trường: xem `.env.example` (giữ file này luôn cập nhật khi thêm biến mới).

## 4. Bản đồ repo

> Cập nhật sau Pass 1: thư mục nào chứa gì (collections Payload, trang công khai, component, tiện ích, seed...).

## 5. Khái niệm cốt lõi

- **Chuyên mục:** hai nhóm lớn (Sản phẩm & Dịch vụ / Thông tin), có chuyên mục con.
- **Hồ sơ (Item):** thực thể độc lập, tồn tại một lần, có trang riêng, có thể nằm trong nhiều bảng.
- **Bảng xếp hạng (List):** chỉ tham chiếu đến item, không chứa thông tin item.
- **Suất tham gia (item trong một bảng):** bản ghi riêng. Vote, thứ hạng, xu hướng, tài trợ, affiliate, mô tả theo ngữ cảnh và người đóng góp đều gắn vào đây. Một item không xuất hiện hai lần trong cùng một bảng.
- **Người đóng góp:** luôn ghi nhận ai tạo/thêm nội dung (dùng cho chia doanh thu sau này).

Mọi thay đổi mô hình dữ liệu phải giữ nguyên các khái niệm trên. Muốn thay đổi thì hỏi tôi trước.

## 6. Quy tắc sản phẩm bất biến

- **Không đề cập AI ở bất kỳ đâu trên giao diện công khai.**
- Nội dung tài trợ luôn có nhãn "Được tài trợ" và **không bao giờ làm thay đổi thứ hạng thật** do vote quyết định.
- Bảng thường trực: mỗi người một vote cho mỗi suất tham gia, được đổi ý.
- Trang công khai cần index (trang chủ, chuyên mục, bảng, item) phải **render phía server**. Không để nội dung cần SEO chỉ xuất hiện phía client.
- Trang item được index ngay khi đăng.
- Đường dẫn gọn, không tiền tố ngôn ngữ, ví dụ `ranker.vn/top-10-dien-thoai-tot-nhat-2026`.

## 7. Design system

Design system được định nghĩa bởi hai file trong codebase:

- `docs/design.md` — bản đặc tả chính thức, viết theo định dạng mở DESIGN.md của Google. **Nguồn chân lý duy nhất** cho mọi quyết định thiết kế: token, màu sắc, typography, spacing, layout, component, UI pattern.
- `docs/design.html` — bản render trực quan của `design.md`.

Nếu hai file mâu thuẫn, `design.md` là đúng; chỉnh `design.html` về cho khớp.

Quy tắc:
1. **Đọc `docs/design.md` trước khi viết hay sửa bất kỳ UI nào** (kể cả custom component trong trang quản trị Payload). Tái sử dụng token, component, pattern đã có. Không hardcode giá trị đã có trong spec.
2. **Đối chiếu sau khi sửa frontend.** Nếu đưa vào thứ spec chưa có (component, token, pattern, quy ước mới), nêu ra và đề xuất chính xác phần cần bổ sung vào `design.md`. Không lệch khỏi spec một cách âm thầm.
3. **Giữ hai file luôn nhất quán.** Sửa file này thì cập nhật file kia trong cùng một commit, rồi kiểm tra lại xem chúng còn khớp không.

## 8. Quy tắc code

### Framework
- Mặc định dùng Server Component. Chỉ thêm `"use client"` khi cần API trình duyệt hoặc tương tác. Giữ phần client nhỏ nhất có thể.
- Truy cập dữ liệu phía server qua API cục bộ của Payload. Không để logic truy cập dữ liệu lọt ra phía client.
- Khi nội dung được đăng hoặc sửa trong admin, các trang công khai liên quan phải được làm mới tự động (revalidate). Không phụ thuộc vào việc build lại toàn bộ site.
- Mỗi trang công khai phải có tiêu đề và mô tả SEO.

### Dữ liệu
- Thay đổi cấu trúc dữ liệu đi qua cơ chế migration của Payload. Không sửa database bằng tay.
- Không sửa tay các file type do Payload tự sinh; chạy lệnh generate.
- Input từ người dùng luôn được validate ở phía server.

### Nội dung và giao diện
- **Tìm trước khi tạo:** trước khi viết component, hàm hay pattern mới, tìm trong codebase xem đã có cái tương tự chưa. Tái sử dụng, không xây trùng.
- **Ưu tiên tính năng có sẵn** của Payload và Next.js trước khi tự code.
- **Editor:** dùng Lexical có sẵn của Payload, không thay bằng editor khác và không tự viết editor. Lưu nội dung dạng dữ liệu cấu trúc của Lexical, **không lưu HTML**. Render phía server ở trang công khai bằng công cụ có sẵn của Payload. Cần thêm định dạng mới thì dùng cơ chế mở rộng (feature, block) của Lexical trong Payload.
- **Chữ trên giao diện:** đi qua thư viện i18n, không viết cứng chuỗi tiếng Việt trong component. Định dạng ngày, số cũng đi qua i18n.
- **Slug:** tự sinh từ tiêu đề, bỏ dấu tiếng Việt, không trùng, sửa được. Cảnh báo khi đổi slug của nội dung đã đăng.
- **Ảnh:** lưu trên R2, bắt buộc có alt text.
- **Xóa dữ liệu quan trọng:** bắt buộc gõ tên để xác nhận (type-to-confirm), không chỉ dialog xác nhận thường. Hiển thị những gì bị ảnh hưởng trước khi xóa.

### Biến môi trường và phụ thuộc
- Biến chỉ dùng phía server không có tiền tố. Biến cần lộ ra trình duyệt mới dùng `NEXT_PUBLIC_`.
- Bí mật chỉ nằm trong `.env.local` hoặc biến môi trường cấu hình trong Coolify, không bao giờ commit.
- Thêm thư viện mới phải có lý do rõ ràng; ưu tiên thư viện đã có trong dự án. Khóa phiên bản.

### Triển khai (Coolify)
- Container có thể bị thay mới bất cứ lúc nào khi deploy: **không lưu file upload hay dữ liệu bền vững trên ổ đĩa container**. Media lưu trên R2, dữ liệu lưu trong Postgres.
- Migration của Payload phải chạy tự động như một bước của quá trình deploy, trước khi app mới nhận traffic.
- Bước build không được phụ thuộc vào việc kết nối database, trừ khi đã xác nhận môi trường build của Coolify truy cập được database.
- Thiết kế để chạy được với nhiều container song song trong tương lai: không giữ trạng thái quan trọng trong bộ nhớ của một tiến trình. Nếu cơ chế làm mới trang (revalidate) chỉ đúng với một container, ghi rõ giới hạn đó.

## 9. Nguyên tắc hành xử khi code

**Nghĩ trước khi code.** Nêu rõ giả định. Nếu có nhiều cách hiểu, trình bày ra, không tự chọn âm thầm. Nếu có cách đơn giản hơn, nói ra. Chỗ nào chưa rõ thì dừng lại và hỏi.

**Đơn giản trước.** Viết ít code nhất giải quyết được vấn đề. Không thêm tính năng, lớp trừu tượng hay "tính linh hoạt" không được yêu cầu.
Ngoại lệ duy nhất: **mô hình dữ liệu** phải chừa chỗ cho các tính năng tương lai đã ghi trong mục 5 và trong prompt của từng pass. Ngoài phạm vi đó, không làm sẵn cho tương lai.

**Sửa đúng chỗ cần sửa.** Không "cải thiện" code, comment hay format ở chỗ không liên quan. Không refactor thứ đang chạy tốt. Theo đúng style hiện có. Thấy code chết không liên quan thì báo, không tự xóa. Chỉ dọn những gì chính thay đổi của mình làm thừa ra. Mỗi dòng thay đổi phải truy được về yêu cầu của tôi.

**Làm theo mục tiêu kiểm chứng được.** Biến nhiệm vụ thành tiêu chí kiểm tra được, ví dụ "sửa bug" → "viết test tái hiện bug, rồi làm cho test pass".

## 10. Quy trình làm việc

1. **Plan Mode trước** với mọi tính năng: khảo sát code, báo lại những gì tìm thấy, rồi mới đề xuất kế hoạch. Chưa viết code khi tôi chưa duyệt.
2. **Không đoán.** Không chắc về tên, cấu trúc hay hành vi thì đọc code hoặc hỏi tôi.
3. **Build narrow:** chỉ làm đúng phạm vi được giao. Tôn trọng tuyệt đối mục "Explicit boundaries — do not build in this pass" trong prompt.
4. **Quyết định quan trọng hỏi dạng multiple-choice:** mỗi lựa chọn có lý do và đánh đổi, đánh dấu phương án Recommended. Nêu rõ nếu phương án không-recommended phù hợp hơn trong trường hợp nào.
5. **Chia bước nhỏ**, mỗi bước có tiêu chí hoàn thành và checklist test tay. Dạng:
   ```
   1. [Bước] → verify: [cách kiểm tra]
   2. [Bước] → verify: [cách kiểm tra]
   ```
6. **Suggest improvements** trong mỗi kế hoạch, chia "nên làm ngay" và "để sau". Chỉ đề xuất, không tự build khi chưa được duyệt.

## 11. Verify trước khi cộng dồn

Sau **mỗi bước**, không ngoại lệ:

1. Chạy đủ gates: format, lint, type-check, test (lệnh ở mục 3).
2. Tự test qua trình duyệt theo checklist của bước đó. Không chỉ tin unit test.
3. Dừng lại, báo kết quả (gates nào pass/fail, đã test tay những gì, phát hiện gì), chờ tôi xác nhận rồi mới sang bước tiếp theo.

Nếu gate fail: sửa nguyên nhân gốc. Không tắt rule, không bỏ qua test, không dùng `any` hay `@ts-ignore` để lách.

## 12. Quản lý thay đổi

- Commit theo chuẩn conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`...
- Cập nhật `CHANGELOG.md` cho thay đổi ảnh hưởng đến người dùng hoặc biên tập viên.
- Khi tôi và bạn thống nhất quy tắc, lệnh, cấu trúc thư mục hoặc quyết định mới có ảnh hưởng lâu dài, **đề xuất cập nhật file này**. Không tự sửa khi chưa được đồng ý.

## Trước khi báo "xong"

- [ ] Format, lint, type-check pass
- [ ] Test liên quan pass
- [ ] Đã test tay qua trình duyệt theo checklist
- [ ] Không thêm `console.log`
- [ ] Không thêm `any` không có lý do
- [ ] Chữ trên giao diện đi qua i18n
- [ ] UI đúng `docs/design.md`; thứ gì mới đã được đề xuất bổ sung vào spec
- [ ] Không có nội dung nào nhắc đến AI trên giao diện công khai
- [ ] Trang công khai mới/sửa vẫn render phía server và có tiêu đề, mô tả SEO
- [ ] `CHANGELOG.md`, `.env.example` và file này đã cập nhật nếu cần