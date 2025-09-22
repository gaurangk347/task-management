import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RBACGuard } from '@task-management/auth';
import { RequiresPermission } from '@task-management/auth';
import { Resource, Action } from '@task-management/auth';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, RBACGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequiresPermission({ resource: Resource.AUDIT_LOG, action: Action.READ })
  findAll() {
    return this.auditService.findAll();
  }

  @Get('my-logs')
  findMyLogs(@Request() req) {
    return this.auditService.findByUser(req.user.id);
  }
}
