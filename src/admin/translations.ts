import type { NestedKeysStripped } from '@payloadcms/translations'

/** Chuỗi giao diện admin của Ranker.vn (dùng qua `useTranslation`, key `ranker:...`). */
export const rankerTranslations = {
  vi: {
    // Bản dịch vi của Payload còn để tiếng Anh ở chỗ này.
    general: { collections: 'Nội dung' },
    // Dùng "Đăng" thay cho "Xuất bản tài liệu" cho gọn và quen thuộc với biên tập viên.
    version: {
      publish: 'Đăng',
      publishChanges: 'Đăng',
      published: 'Đã đăng',
      unpublished: 'Chưa đăng',
      confirmPublish: 'Xác nhận đăng',
    },
    // Plugin redirects chưa có bản tiếng Việt.
    'plugin-redirects': {
      customUrl: 'URL tùy chỉnh',
      documentToRedirect: 'Nội dung đích',
      fromUrl: 'Từ URL',
      internalLink: 'Nội dung trong hệ thống',
      redirectType: 'Loại redirect',
      toUrlType: 'Kiểu đích',
    },
    ranker: {
      urlChangeTitle: 'URL công khai sẽ thay đổi',
      urlChangeFromTo: 'Từ {{from}} thành {{to}}.',
      urlChangeAffected:
        'Ảnh hưởng {{count}} URL. Hệ thống sẽ tự tạo redirect 301 từ URL cũ để không mất thứ hạng tìm kiếm.',
      urlChangeConfirm: 'Tôi xác nhận đổi URL',
      deleteMenu: 'Xóa…',
      deleteHeading: 'Xóa "{{name}}"?',
      deleteLoading: 'Đang kiểm tra những gì bị ảnh hưởng…',
      deleteIrreversible: 'Thao tác này không thể hoàn tác.',
      deleteItemLists: 'Mục này đang nằm trong {{count}} bảng. Mục sẽ bị gỡ khỏi các bảng sau:',
      deleteItemNoLists: 'Mục này chưa nằm trong bảng nào.',
      deleteListEntries: 'Bảng có {{count}} mục. Các mục chỉ bị gỡ khỏi bảng này, không bị xóa.',
      deleteCategoryBlocked:
        'Không thể xóa: chuyên mục còn nội dung. Hãy chuyển chúng sang chuyên mục khác trước.',
      deleteCategoryChildren: '{{count}} chuyên mục con',
      deleteCategoryLists: '{{count}} bảng xếp hạng',
      deleteCategoryItems: '{{count}} mục',
      deleteCategoryEmpty: 'Chuyên mục không còn chuyên mục con, bảng hay mục nào.',
      deleteViewAll: 'Xem tất cả',
      deleteTypeToConfirm: 'Gõ "{{name}}" để xác nhận',
      deleteConfirm: 'Xóa Vĩnh Viễn',
      deleteCancel: 'Hủy',
      deleteClose: 'Đóng',
      deleteDeleting: 'Đang xóa…',
      deleteSuccess: 'Đã xóa "{{name}}".',
    },
  },
}

export type RankerTranslations = (typeof rankerTranslations)['vi']
export type RankerTranslationKeys = NestedKeysStripped<RankerTranslations>
