# Deploy Ranker.vn lên Coolify

Hướng dẫn tạo app Ranker trên Coolify (VPS tự host), dùng Postgres của service Supabase trên cùng VPS
và ảnh trên Cloudflare R2.

## Cách app chạy

- Coolify build image từ `Dockerfile` ngay trên VPS (cần VPS ≥ 8 GB RAM; bước build Next cần hơn 2 GB).
- Build **không** cần kết nối DB.
- Khi container khởi động, `src/instrumentation.ts` khởi tạo Payload và **chạy migration trước khi
  server nhận request**. Migration lỗi thì container không healthy và Coolify giữ container cũ.
- Healthcheck: `GET /healthz` trả 200 khi Payload đã khởi tạo xong và DB trả lời được.
- Bảng của Ranker nằm trong schema `ranker` (không phải `public`), nên REST API tự sinh của Supabase
  không với tới.
- Không lưu file trên ổ đĩa container: ảnh lên R2.

## Giới hạn khi chạy nhiều container

Hiện chỉ nên chạy **1 container**:

- Cache redirect trong `src/proxy.ts` là cache 60 giây của từng tiến trình: redirect mới có thể mất tối
  đa 60 giây để có hiệu lực ở mọi container.
- Cache trang của Next (ISR, `revalidatePath`) nằm trên ổ đĩa của từng container. Khi chạy nhiều
  container cần cache handler dùng chung (làm ở pass dựng trang công khai).

## Chuẩn bị một lần

1. **Supabase phải đang chạy** (Supabase Db ở trạng thái Running).
2. **Mạng nội bộ**: app và Supabase phải cùng một mạng Docker. Ở service Supabase → General → Network,
   đổi "Network attachment" sang lựa chọn cho phép nối vào mạng chung của Coolify, rồi Deploy lại
   Supabase.
3. **Tên host của DB**: Supabase → Terminal → ô chọn container → tên bắt đầu bằng `supabase-db-`.
4. **Bucket R2**: staging dùng chung bucket với `R2_PREFIX=staging` (hoặc bucket riêng).

## Tạo app trên Coolify

1. Project **Ranker** → environment → **+ New** → **Application** → chọn repo GitHub và nhánh cần deploy.
2. **Build Pack**: `Dockerfile`. **Port**: `3000`.
3. **Domain**: ví dụ `https://staging.ranker.vn`.
4. **Healthcheck**: bật, path `/healthz`, port `3000` (Dockerfile cũng đã khai báo HEALTHCHECK).
5. **Environment Variables** (bí mật chỉ nhập ở đây, không commit, không gửi qua chat):

| Biến | Giá trị |
| --- | --- |
| `DATABASE_URL` | `postgres://postgres:MAT_KHAU@supabase-db-XXXX:5432/postgres` (không có dấu `< >`) |
| `DATABASE_POOL_MAX` | `5` |
| `DATABASE_STATEMENT_TIMEOUT_MS` | `30000` (truy vấn chạy quá thời gian này bị hủy) |
| `PAYLOAD_SECRET` | chuỗi ngẫu nhiên mới, ví dụ kết quả của `openssl rand -hex 32`. Mỗi môi trường một chuỗi khác nhau |
| `NEXT_PUBLIC_SERVER_URL` | URL của app, ví dụ `https://staging.ranker.vn` (không có `/` cuối). Đánh dấu là *Build Variable* |
| `NOINDEX` | `true` cho staging, để trống cho production |
| `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL` | như `.env.local` |
| `R2_PREFIX` | `staging` cho staging, để trống cho production |

6. **Deploy**. Lần đầu: migration tạo schema `ranker` và toàn bộ bảng.
7. Mở `https://<domain>/admin` → tạo tài khoản Admin đầu tiên → tạo tài khoản Biên tập viên.

`pnpm seed` không chạy trên staging/production (seed xóa toàn bộ nội dung và tự từ chối khi
`NODE_ENV=production`).

## Kiểm tra sau khi deploy

- `https://<domain>/healthz` → `{"ok":true}`
- `https://<domain>/robots.txt` → `Disallow: /` (staging)
- Chạy lại checklist test tay của Pass 1 trong `docs/plans/2026-10-07-pass-1-backend.md` (mục B9).
