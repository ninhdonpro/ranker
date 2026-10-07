import {
  slugField,
  type Field,
  type FieldAccess,
  type RowField,
  type TextFieldSingleValidation,
} from 'payload'

import { isValidSlug, vnSlugify } from '@/lib/slug'

type Args = {
  /** Field dùng để sinh slug (ví dụ `name`, `title`). */
  useAsSlug: string
  /** Bỏ unique index ở DB khi slug chỉ cần duy nhất trong phạm vi hẹp hơn (ví dụ theo chuyên mục cha). */
  disableUnique?: boolean
  /** Quyền sửa slug sau khi tạo. */
  update?: FieldAccess
}

const validateSlug: TextFieldSingleValidation = (value) =>
  isValidSlug(value) ||
  'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang (ví dụ: phim-viet).'

/**
 * Slug dùng `slugField` có sẵn của Payload, thay hàm slugify bằng bản hỗ trợ tiếng Việt
 * và kiểm tra định dạng ở server.
 */
export const slugFields = ({ useAsSlug, disableUnique, update }: Args): RowField =>
  slugField({
    useAsSlug,
    disableUnique,
    slugify: ({ valueToSlugify }) => vnSlugify(valueToSlugify),
    overrides: (row) => {
      row.fields = row.fields.map((field): Field => {
        if (field.type === 'text' && field.name === 'slug' && !field.hasMany) {
          return {
            ...field,
            label: 'Slug',
            admin: {
              ...field.admin,
              components: {
                ...field.admin?.components,
                Field: {
                  path: '@/admin/SlugFieldWithAccess#SlugFieldWithAccess',
                  clientProps: { useAsSlug },
                },
              },
            },
            ...(update ? { access: { update } } : {}),
            validate: validateSlug,
          }
        }
        if (field.type === 'checkbox') {
          // Việc tự sinh slug do hook của từng collection đảm nhận (src/hooks/autoSlug.ts cho
          // collection có nháp); bỏ hook của Payload vì nó ghi đè hậu tố chống trùng.
          return { ...field, hooks: {}, ...(update ? { access: { update } } : {}) }
        }
        return field
      })
      return row
    },
  })
