# Changelog

Các thay đổi ảnh hưởng đến người dùng và biên tập viên.

## [Chưa phát hành] Pass 1: Nền tảng backend

### Trang quản trị (tiếng Việt)

- **Giao diện mới theo design system của Ranker**: font Inter/Lora, nút navy, logo Ranker, menu bên
  trái nền tối, trang đăng nhập riêng; hỗ trợ cả giao diện sáng và tối.
- **Dashboard**: số bảng/mục/suất đã đăng (kèm số mới trong 7 ngày), việc cần xử lý (bản nháp và
  thay đổi chưa đăng), hoạt động gần đây của cả đội, nút tạo nhanh Bảng và Mục.
- **Bảng danh sách** dễ quét hơn: ảnh nhỏ, chấm màu chuyên mục, nhãn trạng thái Nháp / Đã đăng / Có
  thay đổi chưa đăng, cột ngày đăng.
- **Giao diện admin to và rõ hơn**: nút 44px bo 8px, ô nhập và ô chọn 48px, chữ 16px, hàng bảng cao
  hơn; nền trang xám với bảng và form nằm trong thẻ trắng; thanh đầu trang dày hơn; logo chỉ là chữ
  RANKER.VN; nút đổi sáng/tối và chọn ngôn ngữ bằng lá cờ ở đầu trang.
- **Chuyên mục** hiển thị dạng cây có nút mở/đóng nhánh, form "Thêm chuyên mục" ngay bên trái;
  "Chỉnh sửa" mở dạng popup, "Sửa nhanh" sửa tên và slug ngay tại dòng (đổi slug có cảnh báo URL),
  "Thêm con" điền sẵn chuyên mục cha, kéo-thả để đổi thứ tự giữa các chuyên mục cùng cha, xóa an toàn
  (gõ tên xác nhận) và ô tìm kiếm không dấu.
- **Màn hình sửa**: nút Đăng và menu ⋮ cùng hàng với tiêu đề; trạng thái, ngày chỉnh sửa và ngày tạo
  nằm ở đầu cột bên. Ngày giờ hiển thị theo dd/mm/yyyy.
- Dùng chữ "đăng" thay cho "xuất bản" ở mọi chỗ trong admin.
- Nhãn nút viết hoa chữ cái đầu mỗi từ ("Tạo Mới", "Bộ Lọc", "Lưu Bản Nháp", "Đăng Nhập"); nút thu
  gọn/mở menu dùng icon mới, gọn hơn.
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
  giữ nguyên URL. Bản nháp **tự lưu** mỗi 2 giây; nháp còn trống thông tin vẫn lưu được, thiếu gì
  thì báo khi bấm Đăng.
- **Ngày đăng đầu tiên** của Mục và Bảng được ghi tự động. Suất tham gia có **lịch sử phiên bản** ghi
  lại ai sửa gì.
- **Slug tiếng Việt** tự sinh theo tên cho tới lần đăng đầu, sau đó cố định; không trùng (tự gắn
  hậu tố có nghĩa như năm, khu vực); đổi URL của nội dung đã đăng phải xác nhận và tự tạo
  **redirect 301**.
- **Media** trên Cloudflare R2: bắt buộc alt text, tự chuyển webp và sinh các cỡ ảnh.
- **Xóa an toàn**: phải gõ đúng tên; thấy trước những gì bị ảnh hưởng; chuyên mục còn nội dung thì
  không xóa được.
- Hạ tầng **đa ngôn ngữ** (tiếng Việt mặc định, tiếng Anh chưa dịch thì dùng bản tiếng Việt).
