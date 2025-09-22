import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/auditLog.entity';
import { CreateAuditLogDto } from '@task-management/data';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details?: unknown
  ): Promise<void> {
    await this.create({
      userId,
      action,
      resource,
      resourceId,
      details,
    });

    // Also log to console for immediate visibility
    console.log(
      `AUDIT: User ${userId} performed ${action} on ${resource} ${resourceId}`
    );
  }
}
