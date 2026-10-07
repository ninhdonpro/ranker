/** 20 phim trong bảng mẫu, trích từ prototype/post.html (FILMS). Thứ tự = thứ hạng ban đầu. */
export type SeedFilm = {
  name: string
  year: number
  creators: string
  cast: string | null
  genres: string
  durationMinutes: number
  /** Mô tả theo ngữ cảnh bảng ("Vì sao khán giả yêu thích"). */
  why: string
  facts: { label: string; value: string }[]
}

export const FILMS: SeedFilm[] = [
  {
    name: 'Bố Già',
    year: 2021,
    creators: 'Trấn Thành, Vũ Ngọc Đãng',
    cast: 'Trấn Thành, Tuấn Trần, Ngân Chi',
    genres: 'Gia đình, hài',
    durationMinutes: 128,
    why: 'Câu chuyện về ông Ba Sang và những đứa con trong một xóm lao động Sài Gòn chạm tới gần như mọi gia đình Việt. Phim kết hợp tiếng cười và nước mắt một cách tự nhiên, đưa diễn xuất của Trấn Thành lên một tầm mới.',
    facts: [
      {
        label: 'Doanh thu',
        value: 'hơn 400 tỷ đồng',
      },
      {
        label: 'Phát hành',
        value: 'CGV Việt Nam',
      },
    ],
  },
  {
    name: 'Mắt Biếc',
    year: 2019,
    creators: 'Victor Vũ',
    cast: 'Trần Nghĩa, Trúc Anh',
    genres: 'Tình cảm',
    durationMinutes: 117,
    why: 'Chuyển thể từ tiểu thuyết của Nguyễn Nhật Ánh, Mắt Biếc kể mối tình đơn phương của Ngạn dành cho Hà Lan suốt nhiều năm. Khung cảnh làng Đo Đo, âm nhạc da diết và nhịp phim chậm rãi khiến bộ phim trở thành "ký ức tuổi trẻ" của cả một thế hệ.',
    facts: [
      {
        label: 'Nguyên tác',
        value: 'Nguyễn Nhật Ánh',
      },
      {
        label: 'Nhạc phim',
        value: '"Có chàng trai viết lên cây"',
      },
    ],
  },
  {
    name: 'Hai Phượng',
    year: 2019,
    creators: 'Lê Văn Kiệt',
    cast: 'Ngô Thanh Vân, Mai Cát Vi',
    genres: 'Hành động',
    durationMinutes: 98,
    why: 'Ngô Thanh Vân vào vai người mẹ lao vào thế giới buôn người để cứu con gái. Những pha hành động chân thực, nhịp phim dồn dập và quay tại các khu chợ, xóm trọ đã mở ra một chuẩn mới cho phim hành động Việt.',
    facts: [
      {
        label: 'Phát hành',
        value: 'Netflix toàn cầu',
      },
    ],
  },
  {
    name: 'Đất Rừng Phương Nam',
    year: 2023,
    creators: 'Nguyễn Quang Dũng',
    cast: 'Hạo Khang, Tuấn Trần, Mai Tài Phến',
    genres: 'Phiêu lưu, lịch sử',
    durationMinutes: 110,
    why: 'Hành trình tìm cha của cậu bé An qua miền Tây sông nước những năm 1940. Phim gây tranh luận về chi tiết lịch sử nhưng được khen ngợi nhờ bối cảnh hoành tráng và tình cảm gần gũi với khán giả từng yêu thích bản phim truyền hình.',
    facts: [
      {
        label: 'Nguyên tác',
        value: 'Đoàn Giỏi',
      },
    ],
  },
  {
    name: 'Mai',
    year: 2024,
    creators: 'Trấn Thành',
    cast: 'Phương Anh Đào, Tuấn Trần',
    genres: 'Tâm lý, tình cảm',
    durationMinutes: 131,
    why: 'Câu chuyện về người phụ nữ làm nghề massage và mối tình với chàng trai trẻ hơn. Phim lập kỷ lục doanh thu phim Việt nhưng chia rẽ khán giả: người khen diễn xuất của Phương Anh Đào, người chê kịch bản dài dòng.',
    facts: [
      {
        label: 'Doanh thu',
        value: 'hơn 550 tỷ đồng',
      },
    ],
  },
  {
    name: 'Cánh Đồng Hoang',
    year: 1979,
    creators: 'Nguyễn Hồng Sến',
    cast: 'Lâm Tới, Thúy An',
    genres: 'Chiến tranh',
    durationMinutes: 105,
    why: 'Đôi vợ chồng du kích và đứa con nhỏ sống giữa vùng Đồng Tháp Mười mênh mông nước trong những năm kháng chiến. Gần như không có thoại, bộ phim kể bằng hình ảnh và trở thành một trong những tác phẩm kinh điển nhất của điện ảnh Việt Nam.',
    facts: [
      {
        label: 'Giải thưởng',
        value: 'Huy chương Vàng LHP Moskva 1981',
      },
    ],
  },
  {
    name: 'Tấm Cám: Chuyện Chưa Kể',
    year: 2016,
    creators: 'Ngô Thanh Vân',
    cast: 'Hạ Vi, Isaac, Ngô Thanh Vân',
    genres: 'Cổ trang, giả tưởng',
    durationMinutes: 115,
    why: 'Kể lại truyện cổ tích quen thuộc theo hướng giả tưởng với phục trang và bối cảnh công phu, mở đầu trào lưu phim cổ trang Việt quy mô lớn.',
    facts: [],
  },
  {
    name: 'Song Lang',
    year: 2018,
    creators: 'Leon Lê',
    cast: 'Liên Bỉnh Phát, Isaac',
    genres: 'Tâm lý, âm nhạc',
    durationMinutes: 102,
    why: 'Tình bạn giữa một kép hát cải lương và một tay đòi nợ thuê ở Sài Gòn thập niên 1980, kể bằng hình ảnh đẹp như tranh và tiếng đàn da diết.',
    facts: [],
  },
  {
    name: 'Kẻ Ăn Hồn',
    year: 2023,
    creators: 'Trần Hữu Tấn',
    cast: 'Hoàng Hà, Võ Điền Gia Huy',
    genres: 'Kinh dị',
    durationMinutes: 109,
    why: 'Chuỗi cái chết bí ẩn ở làng Địa Ngục được kể bằng không khí u ám và yếu tố tâm linh dân gian, mở rộng vũ trụ kinh dị thuần Việt.',
    facts: [],
  },
  {
    name: 'Lật Mặt 7: Một Điều Ước',
    year: 2024,
    creators: 'Lý Hải',
    cast: 'Thanh Hiền, Trương Minh Cường',
    genres: 'Gia đình',
    durationMinutes: 138,
    why: 'Câu chuyện người mẹ già và năm người con khiến nhiều khán giả bật khóc, đưa thương hiệu Lật Mặt vượt mốc doanh thu kỷ lục.',
    facts: [],
  },
  {
    name: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
    year: 2015,
    creators: 'Victor Vũ',
    cast: null,
    genres: 'Tuổi thơ',
    durationMinutes: 103,
    why: 'Tuổi thơ ở một làng quê miền Trung qua mắt cậu bé Thiều, chuyển thể nhẹ nhàng và trong trẻo từ truyện của Nguyễn Nhật Ánh.',
    facts: [
      {
        label: 'Nguyên tác',
        value: 'Nguyễn Nhật Ánh',
      },
    ],
  },
  {
    name: 'Ròm',
    year: 2020,
    creators: 'Trần Thanh Huy',
    cast: null,
    genres: 'Tâm lý',
    durationMinutes: 79,
    why: 'Cậu bé chạy số đề trong khu chung cư cũ ở Sài Gòn, với nhịp phim gấp gáp và máy quay sát nhân vật, từng đoạt giải ở LHP Busan.',
    facts: [
      {
        label: 'Giải thưởng',
        value: 'New Currents – LHP Busan 2019',
      },
    ],
  },
  {
    name: 'Cô Ba Sài Gòn',
    year: 2017,
    creators: 'Trần Bửu Lộc, Kay Nguyễn',
    cast: 'Ninh Dương Lan Ngọc, Hồng Vân',
    genres: 'Hài, thời trang',
    durationMinutes: 100,
    why: 'Câu chuyện về chiếc áo dài và một tiệm may gia truyền, được khen nhờ màu sắc rực rỡ và tình yêu dành cho văn hóa Sài Gòn xưa.',
    facts: [],
  },
  {
    name: 'Em Chưa 18',
    year: 2017,
    creators: 'Lê Thanh Sơn',
    cast: 'Kaity Nguyễn, Kiều Minh Tuấn',
    genres: 'Hài, lãng mạn',
    durationMinutes: 105,
    why: 'Bộ phim hài lãng mạn tuổi học trò từng gây sốt phòng vé, nhưng ngày càng bị tranh luận về cách kể chuyện.',
    facts: [],
  },
  {
    name: 'Nhà Bà Nữ',
    year: 2023,
    creators: 'Trấn Thành',
    cast: 'Lê Giang, Uyển Ân, Song Luân',
    genres: 'Gia đình',
    durationMinutes: 102,
    why: 'Gia đình bán bánh canh và những mâu thuẫn giữa các thế hệ. Phim thành công phòng vé nhưng chia rẽ khán giả về cách xây dựng nhân vật.',
    facts: [],
  },
  {
    name: 'Bao Giờ Cho Đến Tháng Mười',
    year: 1984,
    creators: 'Đặng Nhật Minh',
    cast: 'Lê Vân, Hữu Mười',
    genres: 'Chiến tranh, tâm lý',
    durationMinutes: 87,
    why: 'Người vợ giấu tin chồng hy sinh để gia đình yên lòng. Một trong những phim Việt được giới phê bình quốc tế đánh giá cao nhất.',
    facts: [],
  },
  {
    name: 'Mùa Hè Chiều Thẳng Đứng',
    year: 2000,
    creators: 'Trần Anh Hùng',
    cast: 'Trần Nữ Yên Khê, Nguyễn Như Quỳnh',
    genres: 'Chính kịch',
    durationMinutes: 112,
    why: 'Ba chị em gái ở Hà Nội và những bí mật trong một mùa hè, kể bằng nhịp chậm và khung hình tinh tế đặc trưng của Trần Anh Hùng.',
    facts: [],
  },
  {
    name: 'Dòng Máu Anh Hùng',
    year: 2007,
    creators: 'Charlie Nguyễn',
    cast: 'Johnny Trí Nguyễn, Ngô Thanh Vân',
    genres: 'Hành động',
    durationMinutes: 102,
    why: 'Phim võ thuật lấy bối cảnh thời Pháp thuộc, mở đầu làn sóng phim hành động Việt có đầu tư lớn đầu những năm 2000.',
    facts: [],
  },
  {
    name: 'Áo Lụa Hà Đông',
    year: 2006,
    creators: 'Lưu Huỳnh',
    cast: 'Trương Ngọc Ánh, Quách Ngọc Ngoan',
    genres: 'Chiến tranh, chính kịch',
    durationMinutes: 105,
    why: 'Chiếc áo lụa theo người mẹ suốt những năm chiến tranh, câu chuyện về hy sinh và tình mẫu tử từng được chọn đại diện Việt Nam dự Oscar.',
    facts: [],
  },
  {
    name: 'Mùi Đu Đủ Xanh',
    year: 1993,
    creators: 'Trần Anh Hùng',
    cast: null,
    genres: 'Chính kịch',
    durationMinutes: 104,
    why: 'Cô bé giúp việc trong một gia đình Sài Gòn thập niên 1950, được kể bằng âm thanh và hình ảnh tinh tế, từng được đề cử Oscar.',
    facts: [
      {
        label: 'Giải thưởng',
        value: 'Camera d’Or – LHP Cannes 1993',
      },
    ],
  },
]
