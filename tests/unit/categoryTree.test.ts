import { describe, expect, it } from 'vitest'

import {
  buildCategoryTree,
  filterCategoryRows,
  flattenCategoryTree,
  moveCategoryBlock,
  normalizeSearch,
  parentIdsOf,
  visibleCategoryRows,
} from '@/lib/categoryTree'

const doc = (id: number, name: string, parent?: unknown, color?: string | null) => ({
  id,
  name,
  slug: name.toLowerCase(),
  path: name.toLowerCase(),
  parent,
  color,
})

describe('buildCategoryTree', () => {
  it('dựng cây 3 tầng và giữ nguyên thứ tự đầu vào giữa các anh em', () => {
    const tree = buildCategoryTree([
      doc(1, 'B-nhom'),
      doc(2, 'A-nhom'),
      doc(3, 'Y-con', 1),
      doc(4, 'X-con', 1),
      doc(5, 'chau', 3),
    ])
    expect(tree.map((n) => n.name)).toEqual(['B-nhom', 'A-nhom'])
    expect(tree[0]?.children.map((n) => n.name)).toEqual(['Y-con', 'X-con'])
    expect(tree[0]?.children[0]?.children.map((n) => n.name)).toEqual(['chau'])
  })

  it('tính tầng theo vị trí trong cây', () => {
    const rows = flattenCategoryTree(
      buildCategoryTree([doc(1, 'nhom'), doc(2, 'cm', 1), doc(3, 'con', 2)]),
    )
    expect(rows.map((r) => [r.name, r.level])).toEqual([
      ['nhom', 0],
      ['cm', 1],
      ['con', 2],
    ])
  })

  it('flatten theo thứ tự hiển thị: cha rồi đến con của nó', () => {
    const rows = flattenCategoryTree(
      buildCategoryTree([doc(1, 'a'), doc(2, 'b'), doc(3, 'a1', 1), doc(4, 'b1', 2)]),
    )
    expect(rows.map((r) => r.name)).toEqual(['a', 'a1', 'b', 'b1'])
  })

  it('nhận cha dạng id thuần hoặc document đã populate', () => {
    const tree = buildCategoryTree([doc(1, 'nhom'), doc(2, 'x', 1), doc(3, 'y', { id: 1 })])
    expect(tree[0]?.children.map((n) => n.name)).toEqual(['x', 'y'])
  })

  it('màu: dùng màu riêng, không có thì kế thừa từ cha gần nhất', () => {
    const rows = flattenCategoryTree(
      buildCategoryTree([
        doc(1, 'nhom', null, 'film'),
        doc(2, 'cm', 1),
        doc(3, 'con', 2, 'food'),
        doc(4, 'con2', 2),
        doc(5, 'khac'),
      ]),
    )
    expect(Object.fromEntries(rows.map((r) => [r.name, r.color]))).toEqual({
      nhom: 'film',
      cm: 'film',
      con: 'food',
      con2: 'film',
      khac: null,
    })
  })

  it('chuyên mục mồ côi (cha không còn) được xếp lên gốc, không bị mất', () => {
    const tree = buildCategoryTree([doc(1, 'nhom'), doc(2, 'mo-coi', 99)])
    expect(tree.map((n) => [n.name, n.level, n.parentId])).toEqual([
      ['nhom', 0, null],
      ['mo-coi', 0, null],
    ])
  })

  it('danh sách rỗng', () => {
    expect(buildCategoryTree([])).toEqual([])
  })
})

describe('visibleCategoryRows', () => {
  const rows = flattenCategoryTree(
    buildCategoryTree([
      doc(1, 'nhom'),
      doc(2, 'cm', 1),
      doc(3, 'con', 2),
      doc(4, 'cm2', 1),
      doc(5, 'nhom2'),
    ]),
  )
  const names = (expanded: number[]) =>
    visibleCategoryRows(rows, new Set(expanded)).map((row) => row.name)

  it('không mở gì: chỉ thấy nhóm lớn', () => {
    expect(names([])).toEqual(['nhom', 'nhom2'])
  })

  it('mở nhóm lớn: thấy chuyên mục nhưng chưa thấy con của chuyên mục', () => {
    expect(names([1])).toEqual(['nhom', 'cm', 'cm2', 'nhom2'])
  })

  it('mở tới tầng cuối', () => {
    expect(names([1, 2])).toEqual(['nhom', 'cm', 'con', 'cm2', 'nhom2'])
  })

  it('đóng tổ tiên thì cháu bị ẩn dù chính nó đang mở', () => {
    expect(names([2])).toEqual(['nhom', 'nhom2'])
  })
})

describe('parentIdsOf', () => {
  it('chỉ gồm chuyên mục có con', () => {
    const rows = flattenCategoryTree(buildCategoryTree([doc(1, 'a'), doc(2, 'b', 1), doc(3, 'c')]))
    expect([...parentIdsOf(rows)]).toEqual([1])
  })
})

describe('normalizeSearch / filterCategoryRows', () => {
  const rows = flattenCategoryTree(
    buildCategoryTree([
      doc(1, 'Thông tin'),
      doc(2, 'Trường học', 1),
      doc(3, 'Đại học', 2),
      doc(4, 'THPT chuyên', 2),
      doc(5, 'Phim & Series', 1),
      doc(6, 'Sản phẩm'),
    ]),
  )

  it('bỏ dấu, hoa thường và chữ đ', () => {
    expect(normalizeSearch('  ĐẠI Học ')).toBe('dai hoc')
  })

  it('tìm không dấu, giữ lại các tổ tiên của kết quả', () => {
    expect(filterCategoryRows(rows, 'dai hoc')?.map((r) => r.name)).toEqual([
      'Thông tin',
      'Trường học',
      'Đại học',
    ])
  })

  it('từ khóa rỗng không lọc; không khớp trả về danh sách rỗng', () => {
    expect(filterCategoryRows(rows, '  ')).toBeNull()
    expect(filterCategoryRows(rows, 'zzz')).toEqual([])
  })
})

describe('moveCategoryBlock', () => {
  const rows = flattenCategoryTree(
    buildCategoryTree([
      doc(1, 'a'),
      doc(2, 'b'),
      doc(3, 'c'),
      doc(4, 'a1', 1),
      doc(5, 'a2', 1),
      doc(6, 'b1', 2),
    ]),
  )
  const names = (list: typeof rows) => list.map((r) => r.name)

  it('chuyển một chuyên mục xuống sau anh em (kèm con cháu)', () => {
    expect(names(moveCategoryBlock(rows, 1, 2, 'after'))).toEqual(['b', 'b1', 'a', 'a1', 'a2', 'c'])
  })

  it('chuyển lên trước anh em', () => {
    expect(names(moveCategoryBlock(rows, 3, 1, 'before'))).toEqual([
      'c',
      'a',
      'a1',
      'a2',
      'b',
      'b1',
    ])
  })

  it('đổi chỗ hai con cùng cha', () => {
    expect(names(moveCategoryBlock(rows, 5, 4, 'before'))).toEqual([
      'a',
      'a2',
      'a1',
      'b',
      'b1',
      'c',
    ])
  })

  it('không đổi khi khác cha', () => {
    expect(moveCategoryBlock(rows, 4, 2, 'after')).toBe(rows)
  })
})
