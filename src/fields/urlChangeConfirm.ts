import type { CheckboxField } from 'payload'

/**
 * Ô xác nhận đổi URL (không lưu vào DB). Component chỉ hiện khi slug/cha thay đổi làm
 * URL công khai đổi; server từ chối lưu nếu URL đổi mà chưa xác nhận.
 */
export const urlChangeConfirmField = (): CheckboxField => ({
  name: 'confirmUrlChange',
  type: 'checkbox',
  virtual: true,
  admin: {
    position: 'sidebar',
    components: { Field: '@/admin/UrlChangeGuard#UrlChangeGuard' },
  },
})
