/**
 * Dữ liệu mẫu trích từ prototype: chuyên mục (prototype/assets/ranker.js · CATS), các bảng và
 * mục trên trang chủ (homepage.html) và trang chuyên mục (category.html).
 */

type CategoryColor =
  'beauty' | 'education' | 'film' | 'finance' | 'food' | 'music' | 'tech' | 'travel'

export type SeedCategory = {
  name: string
  group: 'info' | 'product'
  icon: string
  color: CategoryColor
  subs: string[]
}

export const GROUPS = [
  {
    slug: 'product',
    name: 'Sản phẩm & Dịch vụ',
    itemRoute: 'review',
    description: 'Những thứ bạn mua hoặc dùng hằng ngày.',
  },
  {
    slug: 'info',
    name: 'Thông tin',
    itemRoute: 'wiki',
    description: 'Những thứ bạn muốn biết, bàn luận và tranh cãi.',
  },
] as const

export const CATEGORIES: SeedCategory[] = [
  {
    name: 'Công nghệ',
    group: 'product',
    icon: '📱',
    color: 'tech',
    subs: ['Điện thoại', 'Laptop', 'Tai nghe', 'Đồng hồ thông minh', 'Máy ảnh', 'Ứng dụng'],
  },
  {
    name: 'Ẩm thực',
    group: 'product',
    icon: '🍜',
    color: 'food',
    subs: ['Phở', 'Bún chả', 'Cà phê', 'Lẩu', 'Quán vỉa hè', 'Nhà hàng', 'Đồ ăn vặt'],
  },
  {
    name: 'Phim & Series',
    group: 'info',
    icon: '🎬',
    color: 'film',
    subs: ['Phim Việt', 'Phim Hàn', 'Phim Mỹ', 'Hoạt hình', 'Series Netflix', 'Kinh dị'],
  },
  {
    name: 'Ca sĩ',
    group: 'info',
    icon: '🎤',
    color: 'music',
    subs: ['V-pop', 'Bolero', 'Rap Việt', 'Nhóm nhạc', 'Ca sĩ trẻ'],
  },
  {
    name: 'Trường học',
    group: 'info',
    icon: '🎓',
    color: 'education',
    subs: ['Đại học', 'THPT chuyên', 'Trung tâm tiếng Anh', 'Du học', 'Khóa học online'],
  },
  {
    name: 'Tài chính',
    group: 'product',
    icon: '💳',
    color: 'finance',
    subs: ['Ngân hàng', 'Ví điện tử', 'Thẻ tín dụng', 'Bảo hiểm', 'App chứng khoán'],
  },
  {
    name: 'Du lịch',
    group: 'product',
    icon: '✈️',
    color: 'travel',
    subs: ['Biển', 'Khách sạn', 'Resort', 'Homestay', 'Hãng bay'],
  },
  {
    name: 'Làm đẹp',
    group: 'product',
    icon: '💄',
    color: 'beauty',
    subs: ['Skincare', 'Kem chống nắng', 'Son môi', 'Nước hoa', 'Spa'],
  },
  {
    name: 'Diễn viên',
    group: 'info',
    icon: '⭐',
    color: 'music',
    subs: ['Diễn viên Việt', 'Diễn viên Hàn', 'Hollywood'],
  },
  {
    name: 'Địa điểm',
    group: 'info',
    icon: '📍',
    color: 'travel',
    subs: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Check-in'],
  },
]

/** Trang chuyên mục Phim & Series (category.html). */
export const FILM_CATEGORY = {
  description:
    'Bảng xếp hạng phim điện ảnh và phim bộ do khán giả Việt bình chọn: từ phim Việt kinh điển, phim Hàn, bom tấn Hollywood đến series Netflix đang hot.',
  about: `Phim & Series trên Ranker.vn tập hợp hơn 200 bảng xếp hạng phim do chính khán giả Việt bình chọn. Mỗi bảng được ban biên tập dựng sẵn danh sách và mô tả, sau đó thứ hạng thay đổi hoàn toàn theo lượt vote của cộng đồng.

Bạn có thể vote lên hoặc vote xuống từng bộ phim, đổi ý bất cứ lúc nào, đề xuất thêm phim còn thiếu, hoặc đề xuất cả một chủ đề mới. Các bảng được cập nhật liên tục nên luôn phản ánh sở thích hiện tại của người xem Việt Nam.`,
  faq: [
    {
      question: 'Thứ hạng phim trên Ranker.vn được tính thế nào?',
      answer:
        'Thứ hạng dựa trên tổng lượt vote lên và vote xuống của người dùng đã đăng nhập. Mỗi người chỉ có một phiếu cho mỗi phim; tài khoản ảo bị hệ thống loại tự động.',
    },
    {
      question: 'Tôi có thể thêm phim còn thiếu vào bảng không?',
      answer:
        'Có. Mở bảng bất kỳ và bấm "Đề Xuất Thêm Mục". Ban biên tập sẽ duyệt và phim được thêm vào để cộng đồng bắt đầu vote.',
    },
    {
      question: 'Có phim nào được trả tiền để lên hạng không?',
      answer:
        'Không. Thứ hạng chỉ đến từ vote. Mọi vị trí tài trợ đều gắn nhãn "Được tài trợ" và không mang số hạng.',
    },
  ],
}

/** Thông tin riêng theo loại của mục mẫu (khớp các block trong src/collections/Items/attributes.ts). */
export type SeedAttributes =
  | { blockType: 'product'; brand?: string; model?: string }
  | { blockType: 'place'; address?: string; district?: string; city?: string }
  | { blockType: 'organization'; headquarters?: string }
  | { blockType: 'creativeWork'; workType: 'movie' | 'series'; year?: number }
  | { blockType: 'person'; profession?: string }

export type SeedItem = { name: string; summary?: string; attributes?: SeedAttributes }

export type SeedList = {
  title: string
  /** Đường dẫn chuyên mục, ví dụ "cong-nghe/dien-thoai". */
  category: string
  itemNoun: string
  items: SeedItem[]
}

const phone = (name: string, brand: string): SeedItem => ({
  name,
  attributes: { blockType: 'product', brand },
})
const place = (name: string, city: string, district?: string): SeedItem => ({
  name,
  attributes: { blockType: 'place', city, district },
})
const film = (name: string, year?: number): SeedItem => ({
  name,
  attributes: { blockType: 'creativeWork', workType: 'movie', year },
})
const series = (name: string): SeedItem => ({
  name,
  attributes: { blockType: 'creativeWork', workType: 'series' },
})

/** Các bảng khác trên trang chủ và trang chuyên mục (mục theo thứ tự đang hiển thị). */
export const OTHER_LISTS: SeedList[] = [
  {
    title: 'Top 10 Điện Thoại Tốt Nhất 2025',
    category: 'cong-nghe/dien-thoai',
    itemNoun: 'điện thoại',
    items: [
      phone('iPhone 16 Pro Max', 'Apple'),
      phone('Galaxy S25 Ultra', 'Samsung'),
      phone('Google Pixel 9 Pro', 'Google'),
    ],
  },
  {
    title: 'Quán Phở Ngon Nhất Hà Nội',
    category: 'am-thuc/pho',
    itemNoun: 'quán',
    items: [
      place('Phở Bát Đàn', 'Hà Nội', 'Hoàn Kiếm'),
      place('Phở Gia Truyền', 'Hà Nội', 'Hoàn Kiếm'),
      place('Phở Thìn Lò Đúc', 'Hà Nội', 'Hai Bà Trưng'),
    ],
  },
  {
    title: 'Laptop Cho Sinh Viên Đáng Mua Nhất',
    category: 'cong-nghe/laptop',
    itemNoun: 'laptop',
    items: [
      phone('MacBook Air M3', 'Apple'),
      phone('ASUS Zenbook 14', 'ASUS'),
      phone('Dell XPS 13', 'Dell'),
    ],
  },
  {
    title: 'Bãi Biển Đẹp Nhất Việt Nam',
    category: 'du-lich/bien',
    itemNoun: 'bãi biển',
    items: [
      place('Phú Quốc', 'Kiên Giang'),
      place('Nha Trang', 'Khánh Hòa'),
      place('Quy Nhơn', 'Bình Định'),
      place('Côn Đảo', 'Bà Rịa – Vũng Tàu'),
    ],
  },
  {
    title: 'Ngân Hàng Có App Tốt Nhất',
    category: 'tai-chinh/ngan-hang',
    itemNoun: 'ngân hàng',
    items: [
      { name: 'Techcombank', attributes: { blockType: 'organization', headquarters: 'Hà Nội' } },
    ],
  },
  { title: 'Ca Sĩ Việt Hát Live Hay Nhất', category: 'ca-si', itemNoun: 'ca sĩ', items: [] },
  {
    title: 'Đại Học Đáng Học Nhất Việt Nam',
    category: 'truong-hoc/dai-hoc',
    itemNoun: 'trường',
    items: [],
  },
  {
    title: 'Kem Chống Nắng Tốt Nhất Cho Da Dầu',
    category: 'lam-dep/kem-chong-nang',
    itemNoun: 'sản phẩm',
    items: [],
  },
  {
    title: 'Tai Nghe Chống Ồn Đáng Mua Nhất',
    category: 'cong-nghe/tai-nghe',
    itemNoun: 'tai nghe',
    items: [],
  },
  {
    title: 'Resort Đà Nẵng Đáng Tiền Nhất',
    category: 'du-lich/resort',
    itemNoun: 'resort',
    items: [],
  },
  {
    title: 'Quán Cà Phê Đẹp Nhất Sài Gòn',
    category: 'am-thuc/ca-phe',
    itemNoun: 'quán',
    items: [],
  },
  // Trang chuyên mục Phim & Series (category.html · LISTS): mục đang dẫn đầu mỗi bảng.
  {
    title: 'Phim Hàn Tình Cảm Hay Nhất Mọi Thời Đại',
    category: 'phim-series/phim-han',
    itemNoun: 'phim',
    items: [series('Hạ Cánh Nơi Anh')],
  },
  {
    title: 'Series Netflix Đáng Xem Nhất 2025',
    category: 'phim-series/series-netflix',
    itemNoun: 'series',
    items: [series('Squid Game 2')],
  },
  {
    title: 'Phim Hoạt Hình Pixar Hay Nhất',
    category: 'phim-series/hoat-hinh',
    itemNoun: 'phim',
    items: [film('Coco', 2017)],
  },
  {
    title: 'Phim Kinh Dị Việt Ám Ảnh Nhất',
    category: 'phim-series/kinh-di',
    itemNoun: 'phim',
    items: [film('Tết Ở Làng Địa Ngục', 2023)],
  },
  {
    title: 'Phim Marvel Hay Nhất, Xếp Hạng Bởi Fan',
    category: 'phim-series/phim-my',
    itemNoun: 'phim',
    items: [film('Avengers: Endgame', 2019)],
  },
  {
    title: 'Phim Tết Việt Đáng Xem Nhất',
    category: 'phim-series/phim-viet',
    itemNoun: 'phim',
    items: [film('Nhà Bà Nữ', 2023)],
  },
  {
    title: 'Phim Hàn Hành Động Kịch Tính Nhất',
    category: 'phim-series/phim-han',
    itemNoun: 'phim',
    items: [film('Ông Trùm', 2012)],
  },
  {
    title: 'Phim Khoa Học Viễn Tưởng Hay Nhất',
    category: 'phim-series/phim-my',
    itemNoun: 'phim',
    items: [film('Interstellar', 2014)],
  },
  {
    title: 'Phim Bộ Việt Gây Sốt Nhất',
    category: 'phim-series/phim-viet',
    itemNoun: 'phim',
    items: [series('Về Nhà Đi Con')],
  },
  {
    title: 'Phim Anime Hay Nhất Mọi Thời Đại',
    category: 'phim-series/hoat-hinh',
    itemNoun: 'phim',
    items: [film('Vùng Đất Linh Hồn', 2001)],
  },
  {
    title: 'Phim Đoạt Oscar Đáng Xem Nhất',
    category: 'phim-series/phim-my',
    itemNoun: 'phim',
    items: [film('Bố Già', 1972)],
  },
  {
    title: 'Phim Việt Chiếu Rạp Doanh Thu Cao Nhất',
    category: 'phim-series/phim-viet',
    itemNoun: 'phim',
    items: [film('Mai', 2024)],
  },
  {
    title: 'Phim Kinh Dị Hàn Đáng Sợ Nhất',
    category: 'phim-series/kinh-di',
    itemNoun: 'phim',
    items: [film('Chuyến Tàu Sinh Tử', 2016)],
  },
  {
    title: 'Diễn Viên Hàn Diễn Xuất Đỉnh Nhất',
    category: 'dien-vien/dien-vien-han',
    itemNoun: 'diễn viên',
    items: [{ name: 'Song Kang-ho', attributes: { blockType: 'person', profession: 'Diễn viên' } }],
  },
  {
    title: 'Series Hàn Hay Nhất Trên Netflix',
    category: 'phim-series/series-netflix',
    itemNoun: 'series',
    items: [series('Vinh Quang Trong Thù Hận')],
  },
]
