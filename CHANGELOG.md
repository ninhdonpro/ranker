# Changelog

Các thay đổi ảnh hưởng đến người dùng và biên tập viên.

## [Chưa phát hành] Pass 1: Nền tảng backend

### Trang quản trị (tiếng Việt)

- Đăng nhập cho nhân sự với hai vai trò **Admin** và **Biên tập viên**; biên tập viên không đổi được
  vai trò, không quản lý người dùng, không xóa nội dung.
- **Chuyên mục** 3 tầng (Nhóm lớn › Chuyên mục › Chuyên mục con) với icon, màu, mô tả, giới thiệu,
  FAQ và SEO. Chỉ Admin tạo, di chuyển, đổi slug, xóa.
- **Mục** (thứ được xếp hạng): mô tả soạn bằng editor, thông tin riêng theo loại (Sản phẩm, Địa
  điểm/Quán, Tác phẩm, Người, Tổ chức), thông tin thêm, ảnh và video YouTube, SEO. URL `/review/...`
  hoặc `/wiki/...` theo nhóm lớn.
- **Bảng xếp hạng**: giới thiệu, luật bình chọn, loại thường trực/sự kiện, tác giả, SEO. URL
  `/list/...`.
- **Suất tham gia**: thêm mục có sẵn hoặc tạo mục mới ngay trong màn hình bảng, mô tả theo ngữ cảnh,
  kéo-thả sắp thứ tự; chặn thêm trùng; màn hình mục hiện các bảng chứa nó.
- **Nháp, đăng và lịch sử phiên bản** cho Mục và Bảng; khôi phục phiên bản chỉ khôi phục nội dung,
  giữ nguyên URL.
- **Slug tiếng Việt** tự sinh, không trùng (tự gắn hậu tố có nghĩa như năm, khu vực); đổi URL của nội
  dung đã đăng phải xác nhận và tự tạo **redirect 301**.
- **Media** trên Cloudflare R2: bắt buộc alt text, tự chuyển webp và sinh các cỡ ảnh.
- **Xóa an toàn**: phải gõ đúng tên; thấy trước những gì bị ảnh hưởng; chuyên mục còn nội dung thì
  không xóa được.
- Hạ tầng **đa ngôn ngữ** (tiếng Việt mặc định, tiếng Anh chưa dịch thì dùng bản tiếng Việt).
