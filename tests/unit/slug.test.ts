import { describe, expect, it } from 'vitest'

import { isValidSlug, vnSlugify } from '@/lib/slug'

describe('vnSlugify', () => {
  it.each([
    ['Phim Việt Hay Nhất Mọi Thời Đại', 'phim-viet-hay-nhat-moi-thoi-dai'],
    ['Đà Lạt', 'da-lat'],
    ['Ẩm thực', 'am-thuc'],
    ['Phim & Series', 'phim-series'],
    ['Top 10 Điện Thoại Tốt Nhất 2026', 'top-10-dien-thoai-tot-nhat-2026'],
    ['  Phở Thìn — Lò Đúc!  ', 'pho-thin-lo-duc'],
    ['Quán Ốc Ữ Ễ Ậ Ở', 'quan-oc-u-e-a-o'],
    ['iPhone 17 Pro Max', 'iphone-17-pro-max'],
  ])('%s → %s', (input, expected) => {
    expect(vnSlugify(input)).toBe(expected)
  })

  it('trả về chuỗi rỗng khi không có ký tự hợp lệ', () => {
    expect(vnSlugify('!!!')).toBe('')
    expect(vnSlugify(undefined)).toBe('')
  })
})

describe('isValidSlug', () => {
  it('chỉ chấp nhận chữ thường không dấu, số và gạch ngang đơn', () => {
    expect(isValidSlug('phim-viet')).toBe(true)
    expect(isValidSlug('Phim-Viet')).toBe(false)
    expect(isValidSlug('phim--viet')).toBe(false)
    expect(isValidSlug('-phim')).toBe(false)
    expect(isValidSlug('phim việt')).toBe(false)
  })
})
