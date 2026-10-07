import type { Access, FieldAccess } from 'payload'

export const ROLES = ['admin', 'editor'] as const
export type Role = (typeof ROLES)[number]

type MaybeUser = { collection?: string; role?: Role | null } | null | undefined

/** Nhân sự = tài khoản trong collection `users` (admin hoặc biên tập viên). */
export const isStaffUser = (user: MaybeUser): boolean =>
  Boolean(user && user.collection === 'users' && user.role && ROLES.includes(user.role))

export const isAdminUser = (user: MaybeUser): boolean => isStaffUser(user) && user?.role === 'admin'

export const adminOnly: Access = ({ req }) => isAdminUser(req.user)

export const staffOnly: Access = ({ req }) => isStaffUser(req.user)

/** Admin thấy mọi tài khoản; biên tập viên chỉ thấy chính mình. */
export const adminOrSelf: Access = ({ req }) => {
  if (isAdminUser(req.user)) return true
  if (isStaffUser(req.user) && req.user) return { id: { equals: req.user.id } }
  return false
}

export const adminOnlyField: FieldAccess = ({ req }) => isAdminUser(req.user)
