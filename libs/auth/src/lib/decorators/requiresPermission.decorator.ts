import { SetMetadata } from '@nestjs/common';
import { RequiredPermission } from '../permissions.enum';

export const PERMISSION_KEY = 'permission';
export const RequiresPermission = (permission: RequiredPermission) =>
  SetMetadata(PERMISSION_KEY, permission);
