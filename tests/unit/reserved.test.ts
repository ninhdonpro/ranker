import { describe, expect, it } from 'vitest'

import { isReservedRootSegment, isSystemRootSegment } from '@/lib/reserved'

describe('từ khóa dành riêng ở gốc URL', () => {
  it.each(['list', 'review', 'wiki', 'product', 'info', 'admin', 'api', '@ninh'])(
    '%s là từ khóa dành riêng',
    (segment) => {
      expect(isReservedRootSegment(segment)).toBe(true)
    },
  )

  it('slug chuyên mục bình thường không bị chặn', () => {
    expect(isReservedRootSegment('phim-series')).toBe(false)
  })

  it('slug của nhóm không phải từ khóa hệ thống', () => {
    expect(isSystemRootSegment('product')).toBe(false)
    expect(isSystemRootSegment('list')).toBe(true)
  })
})
