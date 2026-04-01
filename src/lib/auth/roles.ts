export const USER_ROLES = ["journalist", "editor", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function hasRoleAccess(role: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(role);
}
