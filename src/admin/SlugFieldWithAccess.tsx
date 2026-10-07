'use client'

import { SlugField, TextField } from '@payloadcms/ui'
import type { SlugFieldClientProps } from 'payload'

/**
 * `SlugField` của Payload không tôn trọng quyền sửa field (vẫn cho mở khóa). Người không có
 * quyền sửa slug sẽ thấy ô chỉ đọc; người có quyền dùng component gốc (tự sinh từ tiêu đề).
 */
export const SlugFieldWithAccess = (props: SlugFieldClientProps) =>
  props.readOnly ? <TextField {...props} readOnly /> : <SlugField {...props} />
