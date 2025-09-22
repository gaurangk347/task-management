import { RoleType } from '@task-management/data';
import { Resource, Action, RequiredPermission } from './permissions.enum';

export class RBACUtils {
  private static roleHierarchy: Record<RoleType, number> = {
    [RoleType.VIEWER]: 1,
    [RoleType.ADMIN]: 2,
    [RoleType.OWNER]: 3,
  };

  private static rolePermissions: Record<RoleType, RequiredPermission[]> = {
    [RoleType.VIEWER]: [{ resource: Resource.TASK, action: Action.READ }],
    [RoleType.ADMIN]: [
      { resource: Resource.TASK, action: Action.CREATE },
      { resource: Resource.TASK, action: Action.READ },
      { resource: Resource.TASK, action: Action.UPDATE },
      { resource: Resource.TASK, action: Action.DELETE },
      { resource: Resource.AUDIT_LOG, action: Action.READ },
    ],
    [RoleType.OWNER]: [
      { resource: Resource.TASK, action: Action.CREATE },
      { resource: Resource.TASK, action: Action.READ },
      { resource: Resource.TASK, action: Action.UPDATE },
      { resource: Resource.TASK, action: Action.DELETE },
      { resource: Resource.USER, action: Action.CREATE },
      { resource: Resource.USER, action: Action.READ },
      { resource: Resource.USER, action: Action.UPDATE },
      { resource: Resource.USER, action: Action.DELETE },
      { resource: Resource.AUDIT_LOG, action: Action.READ },
    ],
  };

  static hasPermission(
    userRole: RoleType,
    required: RequiredPermission
  ): boolean {
    const permissions = this.rolePermissions[userRole] || [];
    return permissions.some(
      (p) => p.resource === required.resource && p.action === required.action
    );
  }

  static canAccessOrganization(
    userOrgId: string,
    targetOrgId: string,
    userRole: RoleType,
    orgHierarchy: Map<string, string[]>
  ): boolean {
    if (userOrgId === targetOrgId) return true;

    // Owner can access sub-organizations
    if (userRole === RoleType.OWNER) {
      const subOrgs = orgHierarchy.get(userOrgId) || [];
      return subOrgs.includes(targetOrgId);
    }

    return false;
  }

  static getRoleLevel(role: RoleType): number {
    return this.roleHierarchy[role] || 0;
  }
}
