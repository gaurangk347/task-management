export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  details?: any;
}

export interface CreateAuditLogDto {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: any;
}
