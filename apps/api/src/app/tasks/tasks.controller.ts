import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RBACGuard } from '@task-management/auth';
import { RequiresPermission } from '@task-management/auth';
import { Resource, Action } from '@task-management/auth';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '@task-management/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RBACGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @RequiresPermission({ resource: Resource.TASK, action: Action.CREATE })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  @RequiresPermission({ resource: Resource.TASK, action: Action.READ })
  findAll(@Request() req) {
    return this.tasksService.findAllForUser(req.user);
  }

  @Put(':id')
  @RequiresPermission({ resource: Resource.TASK, action: Action.UPDATE })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @RequiresPermission({ resource: Resource.TASK, action: Action.DELETE })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user);
  }
}
