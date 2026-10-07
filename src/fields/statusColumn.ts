import type { UIField } from 'payload'

/**
 * Cột "Trạng thái" trong bảng danh sách (Nháp / Đã đăng / Có thay đổi chưa đăng), hiển thị bằng
 * `status-pill`. Field giao diện, không lưu dữ liệu và không hiện trong form.
 */
export const statusColumnField = (): UIField => ({
  name: 'statusColumn',
  label: 'Trạng thái',
  type: 'ui',
  admin: {
    components: { Cell: '@/admin/cells/StatusCell#StatusCell' },
  },
})
