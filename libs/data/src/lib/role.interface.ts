export enum RoleType {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export interface Role {
  id: string;
  name: RoleType;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
}
