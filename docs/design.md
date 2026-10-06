---
version: alpha
name: Ranker.vn
description: Hệ thống thiết kế cho Ranker.vn — website xếp hạng mọi thứ do cộng đồng người Việt bình chọn; năng động như báo giải trí nhưng gọn, rõ và đặt nút vote lên hàng đầu.

colors:
  # Thương hiệu
  primary: "#E5262B"
  primary-hover: "#C81E23"
  primary-soft: "#FDECEC"
  primary-text: "#C81E23"
  on-primary: "#FFFFFF"
  # Hành động (nút bấm, chip đang chọn)
  action: "#1E3A8A"
  action-hover: "#162C6B"
  action-soft: "#E8EDF8"
  action-text: "#1E3A8A"
  on-action: "#FFFFFF"
  # Nền & chữ
  surface: "#FFFFFF"
  surface-alt: "#F4F4F6"
  surface-raised: "#FFFFFF"
  inverse: "#111114"
  on-inverse: "#FFFFFF"
  on-surface: "#111114"
  text-secondary: "#52525B"
  text-muted: "#6B6B74"
  border: "#E4E4E8"
  border-strong: "#C9C9D0"
  border-control: "#8E8E99"
  link: "#1F5FBF"
  # Xếp hạng
  vote-down-active: "#3F3F46"
  trend-up: "#AD3E0A"
  trend-up-soft: "#FFF1E8"
  trend-down: "#475569"
  trend-down-soft: "#EEF1F5"
  trend-new: "#047857"
  trend-new-soft: "#E7F6EF"
  medal-gold: "#D4A015"
  medal-silver: "#9AA0AA"
  medal-bronze: "#B8733A"
  sponsored: "#92400E"
  sponsored-soft: "#FEF3C7"
  # Trạng thái
  success: "#15803D"
  success-soft: "#EAF7EF"
  warning: "#B45309"
  warning-soft: "#FFF6E5"
  error: "#B42318"
  error-soft: "#FEF0EE"
  info: "#1D4ED8"
  focus: "#2F6FEB"
  # Màu chuyên mục — tông trầm, chữ trắng ≥ 6,9:1 (chấm, icon, banner, tile)
  cat-tech: "#1F4E79"
  cat-food: "#9A3412"
  cat-beauty: "#9D174D"
  cat-finance: "#065F46"
  cat-travel: "#155E75"
  cat-film: "#5B21B6"
  cat-music: "#86198F"
  cat-education: "#854D0E"
  # Dark mode
  dark-primary: "#E5262B"
  dark-primary-hover: "#F0383D"
  dark-primary-soft: "#3A1012"
  dark-primary-text: "#FF6B6F"
  dark-action: "#4A68D4"
  dark-action-hover: "#3D5BC7"
  dark-action-soft: "#18234A"
  dark-action-text: "#9DB2F5"
  dark-on-action: "#FFFFFF"
  dark-surface: "#0F0F12"
  dark-surface-alt: "#18181D"
  dark-surface-raised: "#202027"
  dark-inverse: "#050507"
  dark-on-surface: "#F4F4F6"
  dark-text-secondary: "#B4B4BD"
  dark-text-muted: "#8E8E98"
  dark-border: "#2A2A31"
  dark-border-strong: "#3C3C45"
  dark-border-control: "#6B6B78"
  dark-link: "#7AA7FF"
  dark-vote-down-active: "#A1A1AA"
  dark-trend-up: "#FB923C"
  dark-trend-up-soft: "#3A1E0E"
  dark-trend-down: "#A9B6C8"
  dark-trend-down-soft: "#1E2430"
  dark-trend-new: "#34D399"
  dark-trend-new-soft: "#0E2E22"
  dark-sponsored: "#FBBF24"
  dark-sponsored-soft: "#3A2A08"
  dark-focus: "#5B8CFF"
  dark-success: "#4ADE80"
  dark-success-soft: "#0E2E1A"
  dark-warning: "#F5A524"
  dark-warning-soft: "#3A2A08"
  dark-error: "#F97066"
  dark-error-soft: "#3A1512"

typography:
  display:
    fontFamily: Lora
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.012em
  h1:
    fontFamily: Lora
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.012em
  h2:
    fontFamily: Lora
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  h3:
    fontFamily: Lora
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.008em
  category:
    fontFamily: Barlow Condensed
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.02em
  section-label:
    fontFamily: Barlow Condensed
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.02em
  title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.014em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: -0.014em
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: -0.011em
  body-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.009em
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.009em
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.06em
  meta:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.006em
  badge:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.003em
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.003em
  rank-number:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: -0.04em
    fontFeature: '"tnum" 1'
  stat:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.045em
    fontFeature: '"tnum" 1'
  vote-count:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.006em
    fontFeature: '"tnum" 1'

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
  gutter: 24px
  sidebar: 320px
  container: 1340px

components:
  nav-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    height: 64px
    padding: "0 {spacing.xl}"
  category-pill:
    textColor: "{colors.on-surface}"
    typography: "{typography.category}"
    padding: "{spacing.sm} {spacing.md}"
  vote-on-tag:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs} {spacing.md}"
  stat-tag:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.on-inverse}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs} {spacing.md}"
  breadcrumb:
    textColor: "{colors.text-secondary}"
    typography: "{typography.meta}"
  ticker:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    height: 44px
  input-search:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.xl}"
    height: 44px
  input-search-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.xl}"
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.on-action}"
  button-primary-disabled:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text-muted}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.action-text}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.xl}"
    height: 44px
  button-secondary-hover:
    backgroundColor: "{colors.action-soft}"
    textColor: "{colors.action-text}"
  button-sm:
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.lg}"
    height: 36px
  button-google:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.xl}"
    height: 48px
  button-load-more:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.action-text}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.2xl}"
    height: 48px
  button-ghost:
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.lg}"
    height: 44px
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 {spacing.lg}"
    height: 36px
  chip-filter-active:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
  vote-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    size: 44px
  vote-button-hover:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
  vote-up-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  vote-down-active:
    backgroundColor: "{colors.vote-down-active}"
    textColor: "{colors.on-primary}"
  vote-count:
    textColor: "{colors.on-surface}"
    typography: "{typography.vote-count}"
  rank-tab:
    textColor: "{colors.on-surface}"
    typography: "{typography.rank-number}"
    rounded: "{rounded.full}"
    size: 44px
  rank-pin:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.sponsored}"
    rounded: "{rounded.full}"
    size: 44px
  rank-tab-gold:
    backgroundColor: "{colors.medal-gold}"
    textColor: "{colors.on-surface}"
  rank-tab-silver:
    backgroundColor: "{colors.medal-silver}"
    textColor: "{colors.on-surface}"
  rank-tab-bronze:
    backgroundColor: "{colors.medal-bronze}"
    textColor: "{colors.on-primary}"
  trend-badge-up:
    backgroundColor: "{colors.trend-up-soft}"
    textColor: "{colors.trend-up}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.md}"
  trend-badge-down:
    backgroundColor: "{colors.trend-down-soft}"
    textColor: "{colors.trend-down}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.md}"
  trend-badge-new:
    backgroundColor: "{colors.trend-new-soft}"
    textColor: "{colors.trend-new}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.md}"
  sponsored-label:
    backgroundColor: "{colors.sponsored-soft}"
    textColor: "{colors.sponsored}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.md}"
  stat-chip:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm} {spacing.md}"
  cross-link:
    textColor: "{colors.action-text}"
    typography: "{typography.body-sm}"
  list-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    padding: "{spacing.xl} 0"
  list-item-skeleton:
    backgroundColor: "{colors.surface-alt}"
    rounded: "{rounded.sm}"
  list-item-thumb:
    rounded: "{rounded.md}"
    size: 88px
  list-item-sponsored:
    backgroundColor: "{colors.sponsored-soft}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl} {spacing.lg}"
  suggest-item:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  list-card:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  category-tile:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  category-hero:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.on-inverse}"
    rounded: "{rounded.lg}"
    padding: "{spacing.2xl}"
  section-header:
    textColor: "{colors.on-surface}"
    typography: "{typography.section-label}"
  byline:
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
  blockquote:
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
    padding: "0 0 0 {spacing.3xl}"
  photo-credit:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-muted}"
    typography: "{typography.caption}"
    padding: "{spacing.sm} {spacing.md}"
  info-card:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  comment:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    padding: "{spacing.lg} 0"
  user-badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.md}"
  modal:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.2xl}"
    width: 480px
  field-label:
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
  field-hint:
    textColor: "{colors.text-muted}"
    typography: "{typography.meta}"
  field-error:
    textColor: "{colors.error}"
    typography: "{typography.meta}"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 {spacing.lg}"
    height: 48px
  input-text-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
  input-text-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.on-surface}"
  input-text-disabled:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-muted}"
  textarea:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md} {spacing.lg}"
    height: 120px
  alert-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
  toast:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.on-inverse}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
  toast-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
  empty-state:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.3xl} {spacing.xl}"
  ad-slot:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
---

# Ranker.vn Design System

## Overview

Ranker.vn là nơi người Việt xếp hạng mọi thứ — từ điện thoại, quán ăn đến phim, ca sĩ, trường học — bằng phiếu bình chọn của chính cộng đồng. Hệ thống này học DNA của ranker.com (tiêu đề chữ hẹp đậm, số hạng to, nhịp "báo giải trí" sôi động, liên kết chéo dày đặc) nhưng làm **gọn hơn, ít màu hơn và đặt nút vote lên hàng đầu**. Người dùng chủ yếu đến từ Google trên điện thoại, đọc lướt, vote vài mục rồi đi tiếp — nên mỗi màn hình phải trả lời ngay "ai đang đứng đầu" và "tôi vote ở đâu". Cảm xúc mục tiêu: **sôi động, đáng tin, dễ tham gia**. Chống chỉ định: trang rối như báo lá cải phủ quảng cáo, và giao diện "startup" vô hồn thiếu chất giải trí. Không nhắc tới AI ở bất kỳ đâu trên giao diện.

## Colors

`primary` đỏ son `#E5262B` là màu **thương hiệu và cảm xúc**: logo, nút vote lên đang bật, nhãn "Bình chọn", số hạng nổi bật và các điểm nhấn hot. Chữ trắng trên `primary` đạt 5,6:1 (AA). Mọi **nút bấm** dùng màu riêng `action` navy `#1E3A8A` (chữ trắng ~10:1): tách nút khỏi đỏ để đỏ không bị "loãng" vì xuất hiện khắp nơi, và để người dùng phân biệt rõ "bấm để làm gì đó" (navy) với "đây là thứ đang hot / đã vote" (đỏ). Navy cũng là màu chip lọc đang chọn và viền nút phụ. Khi đỏ dùng làm chữ trên nền trắng (số liệu, liên kết nhấn), dùng `primary-text` `#C81E23` để đủ tương phản. Phần còn lại là mực đen `on-surface` `#111114` trên nền trắng `surface` và xám `surface-alt` `#F4F4F6` — xám dùng để nhóm nội dung thay cho viền và bóng. `inverse` là khối đen kiểu hero của Ranker, dùng cho banner nổi bật.

Nhãn xu hướng tách khỏi màu thương hiệu: 🔥 `trend-up` cam lửa, 📉 `trend-down` xám đá (giảm hạng là thông tin trung tính, không phải cảnh báo — và không trùng với các màu xanh của nút/link), 🆕 `trend-new` xanh lá — chữ màu đậm, nét mảnh trên nền `*-soft`, vẫn đạt AA. Vote xuống khi bật dùng xám than `vote-down-active`, không dùng đỏ/xanh, tránh xung đột với quy ước "xanh tăng – đỏ giảm" quen thuộc với người Việt. Top 3 dùng `medal-gold/silver/bronze`. Nội dung tài trợ luôn mang `sponsored` (hổ phách) để người đọc phân biệt ngay. `error` gần sắc độ với đỏ thương hiệu, nên thông báo lỗi **luôn** đi kèm icon ⚠ và nền `error-soft` để không bị đọc nhầm thành điểm nhấn thương hiệu; `success`/`warning` cũng có bản `*-soft` cho toast và cảnh báo. Mọi đường viền của control (nút vote, ô nhập liệu) dùng `border-control` (3,2:1 với nền trắng, đạt WCAG 1.4.11) để người mắt kém vẫn thấy rõ khung bấm; `border`/`border-strong` chỉ dùng cho đường phân cách và thẻ. Liên kết trong bài dùng `link` xanh dương — thói quen đọc web, và tránh để chữ đỏ bị hiểu nhầm là lỗi. Màu `cat-*` là **tông trầm** (xanh thép, gỉ sắt, hồng berry, lục bảo, xanh cổ vịt, tím đậm, mận, đồng): đủ khác nhau để phân biệt chuyên mục nhưng không chói, hợp với người đọc mọi lứa tuổi, và chữ trắng đặt lên đều đạt 6,9–9:1. Chỉ dùng cho chấm chuyên mục, icon, nền tile và banner chuyên mục (vị trí bán tài trợ chuyên mục), không bao giờ cho chữ thân bài. Ở dark mode giữ nguyên giá trị; chấm chuyên mục là trang trí (luôn đi kèm tên chuyên mục) nên không cần đạt tương phản.

Dark mode có bộ token `dark-*` song song cùng tên ngữ nghĩa. `dark-primary` giữ nguyên đỏ thương hiệu cho nền nút (giữ chữ trắng đạt AA), còn đỏ dạng chữ chuyển sang `dark-primary-text` `#FF6B6F` sáng hơn. Navy quá tối trên nền đen nên `dark-action` sáng lên thành `#4A68D4` (chữ trắng vẫn đạt AA ~4,8:1); khi hover thì đậm lại `dark-action-hover`. Chữ navy trên nền tối (nút phụ) dùng `dark-action-text` `#9DB2F5` để đạt AA.

## Typography

Ba họ chữ, mỗi họ **một vai duy nhất**, cả ba hỗ trợ tiếng Việt đầy đủ:

| Font | Vai | Dùng cho |
|---|---|---|
| **Lora** (600–700) | Tiêu đề để đọc | `display`, `h1`–`h3`: hero, tên bảng, tiêu đề khối, tên mục, tiêu đề thẻ, modal |
| **Inter** (400–800) | Nội dung **và mọi con số** | thân bài, nút, form, meta; `rank-number`, `stat`, `vote-count`, %, "#1." đứng trước tên mục |
| **Barlow Condensed** (chỉ 700) | Điều hướng & nhãn | logo, `category` (menu, tên chuyên mục), `section-label` và các nhãn HOA |

Lora là serif đương đại, nét mềm, khoảng chữ rộng — đọc tiêu đề dài tiếng Việt dễ hơn hẳn chữ hẹp, cho cảm giác tạp chí đáng tin và khác biệt rõ với Ranker. Inter trung tính, rất dễ đọc ở cỡ nhỏ, có chữ số đều (`tnum`) — dùng bản variable có trục `opsz`. Barlow Condensed giữ chất "bảng xếp hạng" cho menu và nhãn, và chỉ tải một độ đậm (700). **Con số luôn là Inter**: số hạng và số liệu lớn dùng Inter **800 siết chặt** (`rank-number` -0.04em, `stat` -0.045em — gấp đôi mức dynamic metrics thông thường) để khối số gọn, khỏe; số vote và % dùng Inter 700. Khi số đứng trong tiêu đề Lora ("**#1.** iPhone 16 Pro Max"), phần số là Inter 800 cùng cỡ với tiêu đề, tracking -0.04em, màu `primary-text`. Không dùng Inter 900 — ở 14–20px các số 6, 8, 9 bị bết lòng chữ.

Quy tắc sống còn: tiêu đề Lora có **line-height tối thiểu 1.2** (Ranker dùng 1.05 — với dấu chồng như "Ễ", "Ậ", "Ở" sẽ đè dòng trên) và tracking âm nhẹ (-0.008 → -0.012em). Lora rộng hơn chữ hẹp nên thang tiêu đề nhỏ hơn: `display` 40px, `h1` 32px, `h2` 24px, `h3` 20px; trên mobile `display` 30px, `h1` 26px, `h2` 22px. Tiêu đề viết hoa kiểu câu/tiêu đề, không viết HOA toàn bộ. Chữ HOA chỉ cho nhãn ngắn một dòng (`label`, `section-label`). Thang chữ: `display` cho tên bảng xếp hạng ở trang chi tiết; `h1`–`h3` cho tiêu đề trang, khối, tên mục; `title` cho tiêu đề thẻ và liên kết chéo; `body-lg` cho đoạn mở đầu và trích dẫn; `body` cho mô tả; `body-sm`/`caption` cho metadata; `badge` (Inter 500, 13px — mảnh nhưng vẫn đọc rõ) cho nhãn xu hướng; `meta` 14px cho dòng meta và breadcrumb; `category` (Barlow Condensed 700) cho **mọi tên chuyên mục** — pill trên menu, nhãn chuyên mục trên thẻ; ô `category-tile` dùng `h3`. Đối tượng đọc có cả người lớn tuổi nên **không có chữ nội dung nào dưới 13px**: `body-sm` 15px, `caption` 13px. Nhãn nút và chip lọc (`button`) viết **Title Case — hoa chữ cái đầu mỗi từ** ("Gửi Đề Xuất", "Nhiều Vote Nhất"), khác với tiêu đề nội dung vẫn viết hoa kiểu câu. **Tracking của Inter theo cỡ chữ** (theo đường cong dynamic metrics của Inter: chữ càng to siết càng nhiều, chữ nhỏ gần như giữ nguyên để không dính nét): 18px `-0.014em` (≈ -0.25px) · 16px `-0.011em` (≈ -0.18px) · 15px `-0.009em` · 14px `-0.006em` · 13px `-0.003em`. Ngoại lệ: `label` 12px viết HOA giữ `+0.06em` vì chữ HOA cần nới. Không đặt letter-spacing ở `body` rồi để kế thừa — giá trị em bị tính thành px tại phần tử khai báo, nên mỗi cỡ chữ phải mang tracking riêng của nó. Mọi con số (hạng, vote, thống kê) bật `tnum` để không nhảy khi thay đổi theo thời gian thực.

## Layout

Lưới cơ sở 4px; nhịp thường dùng là `sm` 8, `lg` 16, `xl` 24, `2xl` 32, `3xl` 48. Khung nội dung tối đa `container` 1340px, `gutter` 24px; trang chi tiết là 2 cột — danh sách xếp hạng bên trái, `sidebar` 320px bên phải (thông tin bảng, bảng liên quan, ô quảng cáo). Dưới 1024px sidebar rơi xuống cuối; dưới 640px lề ngang 16px.

Mật độ: **thoáng hơn Ranker một bậc**. Danh sách xếp hạng là các hàng nằm trên nền trắng, ngăn nhau bằng đường kẻ `border` 1px — không đóng khung từng mục, để mắt chạy dọc theo cột số hạng và cột vote mà không bị khung hộp cắt nhịp. Trang chủ theo nhịp: thanh ticker → bảng hot hôm nay (thẻ lớn + cột trending) → bảng vừa cập nhật → lưới chuyên mục → chủ đề được đề xuất nhiều nhất. Ô quảng cáo nằm ở vị trí cố định (sidebar, sau mục #3 và #10, cuối trang), luôn có khung và nhãn "Quảng cáo".

## Elevation & Depth

Hệ thống gần như phẳng: phân lớp bằng nền `surface-alt` và đường viền `border` 1px, không dùng bóng cho thẻ thường. Bóng chỉ dành cho thứ thực sự nổi trên trang: `shadow-sm` (0 1px 2px rgba(17,17,20,.06)) cho nút vote — gợi cảm giác "bấm được"; `shadow-lg` (0 12px 32px rgba(17,17,20,.12)) cho dropdown gợi ý tìm kiếm, menu, header dính khi cuộn và hộp thoại đăng nhập. Ở dark mode bóng gần như vô hình, nên thay bằng `dark-surface-raised` và viền `dark-border-strong`.

## Shapes

Bo góc mềm vừa phải — mềm hơn kiểu vuông góc cũ của Ranker, nhưng không tròn trịa kiểu đồ chơi. Ảnh, thẻ và khối mục được tài trợ dùng `md` 12px; banner chuyên mục dùng `lg` 16px; nút vote dùng `sm` 8px (đủ chắc tay, giống một phím bấm); huy chương top 3 là hình tròn; nhãn "Bình chọn" dùng `xs` 4px. Mọi thứ "chọn/lọc/trạng thái" — nút, chip lọc, ô tìm kiếm, nhãn xu hướng, huy hiệu — dùng `full` (viên thuốc). Quy tắc: viên thuốc = có thể bấm/chọn; góc bo = nội dung.

## Components

**Mục được tài trợ không mang số hạng.** `list-item-sponsored` thay số bằng `rank-pin` (📌, chữ `sponsored`) và **không chiếm thứ tự** — các mục sau vẫn đánh số liên tục theo vote. Dòng meta ghi rõ "Hạng thật theo vote #6". Tối đa 1 hàng tài trợ trong mỗi 10 mục.

**Dòng xếp hạng (`list-item`)** là trái tim của sản phẩm — một hàng duy nhất, đọc từ trái sang phải: `rank-tab` (số hạng) → `list-item-thumb` (ảnh 88px, bo `md`) → nội dung → cột vote. Nội dung gồm tên mục (`h3`) kèm nhãn xu hướng cùng dòng, dòng phụ (`body-sm`, `text-muted`), mô tả tối đa 2 dòng (`body-sm` 15px, `text-secondary`, cắt bằng line-clamp, bấm vào hàng để mở trang chi tiết mục) và một dòng meta (`meta` 14px, chỉ 2 màu: xám cho thông tin, `action-text` cho mọi link): "81% tán thành · Cũng đứng #2 trong … · Xem giá ↗". Cột vote nằm sát mép phải, xếp dọc ▲ / số vote / ▼ — vị trí cố định ở mọi hàng nên mắt quét dọc rất nhanh, và vừa tầm ngón cái trên điện thoại. Hàng ngăn nhau bằng đường kẻ, không có khung. `rank-tab` là chữ số trần; top 3 là huy chương tròn `rank-tab-gold/silver/bronze`. Mobile giữ nguyên bố cục hàng (ảnh 64px, mô tả 2 dòng). Liên kết chéo (`cross-link`) chỉ một cái mỗi hàng để giữ gọn; danh sách đầy đủ để ở trang chi tiết mục.

**Vote**: `vote-button` 44px có viền `border-control` + `shadow-sm`, xếp dọc với `vote-count` ở giữa; hover → `vote-button-hover`; đã vote lên → `vote-up-active`; đã vote xuống → `vote-down-active`. Bấm lần nữa để bỏ vote, bấm nút kia để đổi ý. Số vote cập nhật ngay (optimistic) với hiệu ứng đếm ngắn. Chưa đăng nhập: nút vẫn hiện bình thường, bấm thì mở hộp đăng nhập Google, không bao giờ làm mờ nút. Vùng chạm tối thiểu 44px.

**Nhãn**: `trend-badge-up/down/new` đặt cạnh tên mục, dùng chữ `badge` thanh mảnh (400) để nhãn nhẹ hơn tên mục và không tranh chú ý với nút vote; màu nền `*-soft` đã đủ để nhận diện; `sponsored-label` "Được tài trợ" bắt buộc trên mọi `list-item-sponsored` (nền `sponsored-soft`, bo `md` + nhãn; dòng meta ghi rõ hạng thật theo vote). `user-badge` cho huy hiệu và điểm uy tín ở trang cá nhân và bình luận.

**Nút**: mọi nút dùng họ màu `action` navy, không dùng đỏ. `button-primary` (nền `action`) cho một hành động chính mỗi khu vực ("Gửi Đề Xuất", "Đăng Nhập Với Google", "Xem Giá"); `button-secondary` nền trắng, viền `action`, chữ `action-text`, hover nền `action-soft`; `button-ghost` cho hành động phụ. `chip-filter` có viền `border-control`, bản đang chọn là `chip-filter-active` nền `action`; trên mobile chip cao 40px. `button-sm` (36px) cho chỗ chật như header ("Đăng Nhập") và hành động bình luận. Ngoại lệ duy nhất: nút vote lên khi đã bật chuyển đỏ `primary` — đó là trạng thái, không phải lời kêu gọi. `suggest-item` là khối viền nét đứt ở cuối danh sách: "➕ Đề Xuất Thêm". Mọi nhãn nút, chip lọc, link hành động ("Xem Giá ↗") và `suggest-item` viết Title Case **ngay trong nội dung** — không dùng `text-transform: capitalize` vì nó làm hỏng tên thương hiệu ("iPhone" → "IPhone", "eSIM" → "ESIM").

**Điều hướng và khám phá**: `nav-header` gồm logo giữa, tìm kiếm + menu phải, bên dưới là hàng `category-pill` có chấm màu `cat-*` và `vote-on-tag` "BÌNH CHỌN". `breadcrumb` ("Trang chủ › Công nghệ › Điện thoại") nằm trên tiêu đề trang chi tiết, khớp schema BreadcrumbList cho SEO. `ticker` chạy biến động thứ hạng ("#1 iPhone 16 ↗ trong Điện thoại tốt nhất"). `input-search` viên thuốc; khi focus → `input-search-focus` + vòng `focus` 2px + dropdown gợi ý `shadow-lg`. `list-card` cho trang chủ (ảnh ghép 3 tấm + nhãn chuyên mục + tiêu đề `h3`), `category-tile` cho lưới chuyên mục, `category-hero` cho banner chuyên mục (nền lấy màu `cat-*` hoặc màu brand nhà tài trợ).

**Nội dung**: `section-header` là nhãn HOA kèm icon logo và đường kẻ kéo dài; phần đầu trang chi tiết đặt trên nền trắng theo thứ tự `byline` (avatar, tác giả, ngày cập nhật, lượt xem, số mục) → `ranked-by` (tag `stat-tag` nền mực đen "Xếp hạng bởi" + số người vote, tổng vote — không dùng tag đỏ, để đỏ chỉ còn nghĩa "bình chọn") → đoạn mở đầu → ảnh kèm `photo-credit`; `blockquote` có dấu ngoặc kép lớn màu `border-strong`; `photo-credit` dưới ảnh; `info-card` ở sidebar ("Mới thêm", "Gây tranh cãi nhất", "Cách xếp hạng hoạt động"); `comment` có avatar, tên, `user-badge`, hành động (vote, trả lời, báo cáo) là `button-sm` dạng ghost cao 36px, trả lời thụt lề `xl`. `ad-slot` luôn có nhãn "Quảng cáo" và giữ sẵn chiều cao để không đẩy layout (CLS).

**Biểu mẫu & phản hồi (Giai đoạn 1)**: `modal` (bo `xl`, rộng 480px, nền phủ mực đen 50%, `shadow-lg`; trên mobile thành bottom sheet bo 2 góc trên) dùng cho đăng nhập và đề xuất. **Đăng nhập**: bấm vote/bình luận khi chưa đăng nhập mở modal "Đăng Nhập Để Bình Chọn" với một nút duy nhất `button-google` (nền trắng, viền `border-control`, logo Google) — giữ lại thao tác vote đang chờ và tự áp dụng sau khi đăng nhập. **Form**: `field-label` (Inter 600) → `input-text`/`textarea` (48px, viền `border-control`, focus: viền `action` + vòng `focus`, lỗi: nền `error-soft` + viền `error` + `field-error` có icon ⚠) → `field-hint` (vd. "Còn 3/5 lượt đề xuất hôm nay"). `alert-warning` (nền `warning-soft`, icon ⚠ màu `warning`) cảnh báo mục có thể trùng, kèm link tới mục đã có. **Phản hồi**: `toast` nền mực đen ở cạnh dưới màn hình 3–4 giây ("✓ Đã ghi nhận bình chọn", có nút "Hoàn Tác"); `toast-error` nền `error-soft`. **Tải dữ liệu**: `list-item-skeleton` giữ đúng bố cục hàng (số, ảnh, 3 dòng, cột vote) để không giật layout; danh sách dài dùng `button-load-more` "Xem Thêm 10 Mục" (giữ được URL `?page=2` cho SEO) thay vì cuộn vô hạn. `empty-state` (icon lớn, một câu, một nút) cho bình luận trống, tìm kiếm không có kết quả.

## Do's and Don'ts

**Nên**
- Giữ nút vote là thứ dễ thấy nhất trong mỗi dòng xếp hạng: cột dọc 44px sát mép phải, viền rõ, số vote ở giữa.
- Dùng navy `action` cho mọi nút; giữ đỏ `primary` cho thương hiệu, vote lên đang bật, số hạng và điểm nhấn hot.
- Tiêu đề Lora với line-height ≥ 1.2; kiểm tra bằng chuỗi có dấu chồng ("Ễ Ậ Ở Ữ") trước khi chốt.
- Mọi con số dùng Inter: 800 siết chặt cho số hạng/số liệu, 700 cho số vote và %; Barlow chỉ cho menu, tên chuyên mục và nhãn HOA.
- Gắn nhãn "Được tài trợ" và nền hổ phách nhạt cho mọi mục, bảng hoặc chuyên mục có trả tiền.
- Bật `tnum` cho mọi con số thay đổi theo thời gian thực.
- Viết nhãn nút và chip lọc theo Title Case ngay trong nội dung: "Gửi Đề Xuất", "Lưu Bảng", "Xem Giá ↗".
- Giữ chữ nội dung ≥ 13px và viền control bằng `border-control` cho người lớn tuổi.
- Đặt 1–3 liên kết chéo trong mỗi mục để tăng liên kết nội bộ cho SEO.

**Không nên**
- Không viết HOA toàn bộ tiêu đề có dấu; chữ HOA chỉ cho nhãn ngắn một dòng.
- Không gắn số hạng cho mục được tài trợ; số hạng chỉ phản ánh vote thật.
- Không để quảng cáo trông giống một mục xếp hạng, và không chèn quá một quảng cáo giữa danh sách mỗi 7 mục.
- Không dùng đỏ/xanh lá cho vote xuống/lên (đụng quy ước chứng khoán); không dùng đỏ cho liên kết thường.
- Không làm mờ hay ẩn nút vote khi chưa đăng nhập; mở hộp đăng nhập khi bấm.
- Không dùng đỏ `primary` làm nền nút; không thêm màu nhấn mới ngoài palette; màu `cat-*` không dùng cho chữ thân bài.
- Không nhắc tới "AI", "tự động tạo" hay công nghệ sinh nội dung ở bất kỳ đâu trên giao diện.
