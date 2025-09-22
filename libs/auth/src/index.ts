// Shared utilities
export * from './lib/permissions.enum';
export * from './lib/rbac.utils';

// NestJS specific (backend)
export * from './lib/decorators/requiresPermission.decorator';
export * from './lib/guards/rbac.guard';
export * from './lib/interceptors/audit.interceptor';
