/** Lấy id từ giá trị relationship (id thuần hoặc document đã populate). */
export function relId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value)))
    return Number(value)
  if (value && typeof value === 'object' && 'id' in value) return relId(value.id)
  return null
}
