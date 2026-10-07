import type { Block, TextFieldSingleValidation } from 'payload'

const currentYear = () => new Date().getFullYear()

const year = (name: string, label: string) =>
  ({
    name,
    label,
    type: 'number',
    min: 1000,
    max: currentYear() + 10,
    admin: { step: 1 },
  }) as const

const validateUrl: TextFieldSingleValidation = (value) =>
  !value || /^https?:\/\/\S+\.\S+$/.test(value) || 'URL phải bắt đầu bằng http:// hoặc https://'

/**
 * Thông tin riêng theo loại mục, chia theo nhóm lớn của schema.org để dùng lại cho schema markup.
 * Chi tiết lẻ không thuộc nhóm nào (ví dụ "Doanh thu", "Pin") đặt ở field `facts` của mục.
 */
export const attributeBlocks: Block[] = [
  {
    slug: 'product',
    interfaceName: 'ProductAttributes',
    labels: { singular: 'Sản phẩm', plural: 'Sản phẩm' },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'brand', label: 'Hãng', type: 'text' },
          { name: 'model', label: 'Model', type: 'text' },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'price', label: 'Giá tham khảo (VNĐ)', type: 'number', min: 0 },
          {
            name: 'releaseDate',
            label: 'Ngày ra mắt',
            type: 'date',
            admin: { date: { displayFormat: 'dd/MM/yyyy' } },
          },
        ],
      },
    ],
  },
  {
    slug: 'place',
    interfaceName: 'PlaceAttributes',
    labels: { singular: 'Địa điểm / Quán', plural: 'Địa điểm / Quán' },
    fields: [
      { name: 'address', label: 'Địa chỉ', type: 'text' },
      {
        type: 'row',
        fields: [
          { name: 'district', label: 'Quận / huyện', type: 'text' },
          { name: 'city', label: 'Tỉnh / thành phố', type: 'text' },
        ],
      },
      {
        name: 'priceRange',
        label: 'Mức giá',
        type: 'select',
        options: [
          { value: 'budget', label: 'Bình dân' },
          { value: 'moderate', label: 'Trung bình' },
          { value: 'upscale', label: 'Cao cấp' },
          { value: 'luxury', label: 'Sang trọng' },
        ],
      },
    ],
  },
  {
    slug: 'creativeWork',
    interfaceName: 'CreativeWorkAttributes',
    labels: { singular: 'Tác phẩm', plural: 'Tác phẩm' },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'workType',
            label: 'Loại tác phẩm',
            type: 'select',
            options: [
              { value: 'movie', label: 'Phim' },
              { value: 'series', label: 'Phim bộ / series' },
              { value: 'book', label: 'Sách' },
              { value: 'song', label: 'Bài hát' },
              { value: 'album', label: 'Album' },
              { value: 'game', label: 'Game' },
              { value: 'show', label: 'Chương trình' },
            ],
          },
          year('year', 'Năm'),
        ],
      },
      { name: 'creators', label: 'Đạo diễn / tác giả', type: 'text' },
      { name: 'cast', label: 'Diễn viên / nghệ sĩ', type: 'text' },
      {
        type: 'row',
        fields: [
          { name: 'genres', label: 'Thể loại', type: 'text' },
          { name: 'durationMinutes', label: 'Thời lượng (phút)', type: 'number', min: 1 },
          {
            name: 'releaseDate',
            label: 'Ngày phát hành',
            type: 'date',
            admin: { date: { displayFormat: 'dd/MM/yyyy' } },
          },
        ],
      },
    ],
  },
  {
    slug: 'person',
    interfaceName: 'PersonAttributes',
    labels: { singular: 'Người', plural: 'Người' },
    fields: [
      {
        type: 'row',
        fields: [
          year('birthYear', 'Năm sinh'),
          { name: 'profession', label: 'Nghề nghiệp', type: 'text' },
          { name: 'hometown', label: 'Quê quán', type: 'text' },
        ],
      },
    ],
  },
  {
    slug: 'organization',
    interfaceName: 'OrganizationAttributes',
    labels: { singular: 'Tổ chức', plural: 'Tổ chức' },
    fields: [
      {
        type: 'row',
        fields: [
          year('foundedYear', 'Năm thành lập'),
          { name: 'headquarters', label: 'Trụ sở', type: 'text' },
        ],
      },
      { name: 'website', label: 'Website', type: 'text', validate: validateUrl },
    ],
  },
]
