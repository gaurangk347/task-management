export enum Resource {
  TASK = 'task',
  USER = 'user',
  ORGANIZATION = 'organization',
  AUDIT_LOG = 'audit_log',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface RequiredPermission {
  resource: Resource;
  action: Action;
}
