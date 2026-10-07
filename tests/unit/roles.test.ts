import { describe, expect, it } from 'vitest'

import { isAdminUser, isStaffUser } from '@/access/roles'

describe('vai trò nhân sự', () => {
  it('nhận diện admin và biên tập viên trong collection users', () => {
    expect(isAdminUser({ collection: 'users', role: 'admin' })).toBe(true)
    expect(isStaffUser({ collection: 'users', role: 'editor' })).toBe(true)
    expect(isAdminUser({ collection: 'users', role: 'editor' })).toBe(false)
  })

  it('không coi người chưa đăng nhập hay tài khoản ngoài users là nhân sự', () => {
    expect(isStaffUser(null)).toBe(false)
    expect(isStaffUser({ collection: 'members', role: 'admin' })).toBe(false)
    expect(isAdminUser({ collection: 'members', role: 'admin' })).toBe(false)
  })
})
