import { relId } from '@/lib/relations'

/** Một chuyên mục trong cây (Nhóm lớn › Chuyên mục › Chuyên mục con). */
export type CategoryNode = {
  id: number
  name: string
  slug: string
  /** Đường dẫn công khai (không có `/` đầu), null nếu chưa có. */
  path: string | null
  /** 0 = nhóm lớn, 1 = chuyên mục, 2 = chuyên mục con; tính theo vị trí trong cây. */
  level: number
  /** Màu `cat-*` của chuyên mục, hoặc của chuyên mục cha gần nhất nếu chưa đặt. */
  color: string | null
  parentId: number | null
  /** Khóa thứ tự (`_order`, khóa phân số của Payload) để đổi chỗ bằng /api/reorder. */
  order: string | null
  children: CategoryNode[]
}

type CategoryInput = {
  id: number
  name: string
  slug: string
  path?: string | null
  parent?: unknown
  color?: string | null
  _order?: string | null
}

/**
 * Dựng cây từ danh sách phẳng. Giữ nguyên thứ tự đầu vào giữa các chuyên mục cùng cha: truy vấn
 * sắp theo `_order` ở DB (khóa phân số của Payload), không sắp lại ở đây để khỏi lệch collation.
 * Chuyên mục có cha không còn trong danh sách được xếp lên gốc để không bị mất khỏi màn hình.
 */
export function buildCategoryTree(docs: CategoryInput[]): CategoryNode[] {
  const ids = new Set(docs.map((doc) => doc.id))
  const byParent = new Map<number | null, CategoryInput[]>()
  for (const doc of docs) {
    const parentId = relId(doc.parent)
    const key = parentId !== null && ids.has(parentId) ? parentId : null
    byParent.set(key, [...(byParent.get(key) ?? []), doc])
  }

  const build = (
    parentId: number | null,
    level: number,
    inheritedColor: string | null,
  ): CategoryNode[] =>
    (byParent.get(parentId) ?? []).map((doc) => {
      const color = doc.color ?? inheritedColor
      return {
        id: doc.id,
        name: doc.name,
        slug: doc.slug,
        path: doc.path ?? null,
        level,
        color,
        parentId,
        order: doc._order ?? null,
        children: build(doc.id, level + 1, color),
      }
    })

  return build(null, 0, null)
}

/** Duyệt cây theo thứ tự hiển thị (cha rồi đến con của nó). */
export function flattenCategoryTree(nodes: CategoryNode[]): CategoryRow[] {
  return nodes.flatMap(({ children, ...node }) => [node, ...flattenCategoryTree(children)])
}

export type CategoryRow = Omit<CategoryNode, 'children'>

/** Id các chuyên mục có ít nhất một con (để biết dòng nào có nút mở/đóng). */
export function parentIdsOf(rows: CategoryRow[]): Set<number> {
  return new Set(rows.flatMap((row) => (row.parentId === null ? [] : [row.parentId])))
}

/**
 * Các dòng đang hiện khi chỉ những chuyên mục trong `expanded` được mở: một dòng hiện khi mọi
 * tổ tiên của nó đều mở. `rows` đã ở thứ tự hiển thị (cha trước con).
 */
export function visibleCategoryRows(rows: CategoryRow[], expanded: ReadonlySet<number>) {
  const shown = new Set<number>()
  return rows.filter((row) => {
    const visible = row.parentId === null || (shown.has(row.parentId) && expanded.has(row.parentId))
    if (visible) shown.add(row.id)
    return visible
  })
}

/** Bỏ dấu, bỏ hoa thường để tìm kiếm tên tiếng Việt ("duong" khớp "Đường"). */
export const normalizeSearch = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()

/**
 * Kết quả tìm kiếm: các chuyên mục có tên khớp cùng mọi tổ tiên của chúng (để còn thấy cây), giữ
 * nguyên thứ tự hiển thị. Từ khóa rỗng trả về null (không lọc).
 */
export function filterCategoryRows(rows: CategoryRow[], query: string): CategoryRow[] | null {
  const needle = normalizeSearch(query)
  if (!needle) return null
  const byId = new Map(rows.map((row) => [row.id, row]))
  const keep = new Set<number>()
  for (const row of rows) {
    if (!normalizeSearch(row.name).includes(needle)) continue
    for (let cur: CategoryRow | undefined = row; cur; cur = byId.get(cur.parentId ?? -1)) {
      keep.add(cur.id)
    }
  }
  return rows.filter((row) => keep.has(row.id))
}

/** Khoảng [bắt đầu, kết thúc) của một chuyên mục cùng toàn bộ con cháu trong danh sách phẳng. */
function subtreeRange(rows: CategoryRow[], index: number): [number, number] {
  const level = rows[index]?.level ?? 0
  let end = index + 1
  while (end < rows.length && (rows[end]?.level ?? 0) > level) end++
  return [index, end]
}

/**
 * Chuyển chuyên mục `movedId` (kèm con cháu) tới trước hoặc sau chuyên mục anh em `targetId`
 * (kèm con cháu của nó). Dùng để cập nhật giao diện ngay khi kéo-thả, trước khi server xác nhận.
 * Không đổi gì nếu hai chuyên mục không cùng cha.
 */
export function moveCategoryBlock(
  rows: CategoryRow[],
  movedId: number,
  targetId: number,
  position: 'before' | 'after',
): CategoryRow[] {
  const from = rows.findIndex((row) => row.id === movedId)
  const to = rows.findIndex((row) => row.id === targetId)
  if (from < 0 || to < 0 || rows[from]?.parentId !== rows[to]?.parentId) return rows
  const [fromStart, fromEnd] = subtreeRange(rows, from)
  const block = rows.slice(fromStart, fromEnd)
  const rest = [...rows.slice(0, fromStart), ...rows.slice(fromEnd)]
  const targetIndex = rest.findIndex((row) => row.id === targetId)
  const [targetStart, targetEnd] = subtreeRange(rest, targetIndex)
  const insertAt = position === 'before' ? targetStart : targetEnd
  return [...rest.slice(0, insertAt), ...block, ...rest.slice(insertAt)]
}
