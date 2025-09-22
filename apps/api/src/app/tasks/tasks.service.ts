import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, RoleType } from '@task-management/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) {}

  async create(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: user.id,
      organizationId: user.organizationId,
      assigneeId: createTaskDto.assigneeId || user.id,
    });

    return this.taskRepository.save(task);
  }

  async findAllForUser(user: any): Promise<Task[]> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    // Scope tasks based on user role and organization
    if (user.role === RoleType.OWNER) {
      // Owner can see all tasks in their org and sub-orgs
      queryBuilder.where('task.organizationId = :orgId', {
        orgId: user.organizationId,
      });
    } else if (user.role === RoleType.ADMIN) {
      // Admin can see all tasks in their organization
      queryBuilder.where('task.organizationId = :orgId', {
        orgId: user.organizationId,
      });
    } else {
      // Viewer can only see tasks assigned to them
      queryBuilder.where('task.assigneeId = :userId', { userId: user.id });
    }

    return queryBuilder.getMany();
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: any
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user can update this task
    if (!this.canUserModifyTask(task, user)) {
      throw new ForbiddenException('Cannot update this task');
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, user: any): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!this.canUserModifyTask(task, user)) {
      throw new ForbiddenException('Cannot delete this task');
    }

    await this.taskRepository.remove(task);
  }

  private canUserModifyTask(task: Task, user: any): boolean {
    // Owner and Admin can modify any task in their org
    if (user.role === RoleType.OWNER || user.role === RoleType.ADMIN) {
      return task.organizationId === user.organizationId;
    }

    // Others can only modify their own tasks
    return task.assigneeId === user.id || task.createdBy === user.id;
  }
}
