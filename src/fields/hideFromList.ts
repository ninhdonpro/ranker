import type { CheckboxField, UIField } from 'payload'

/**
 * Ẩn field không phải dữ liệu để biên tập (field giao diện, ô xác nhận ảo) khỏi danh sách cột và
 * bộ lọc của màn hình danh sách; form sửa vẫn hiện bình thường.
 */
export const hideFromList = <F extends UIField | CheckboxField>(field: F): F => ({
  ...field,
  admin: { ...field.admin, disableListColumn: true, disableListFilter: true },
})
