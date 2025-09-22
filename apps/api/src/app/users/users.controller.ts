import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RBACGuard } from '@task-management/auth';
import { RequiresPermission } from '@task-management/auth';
import { Resource, Action } from '@task-management/auth';
import { UsersService } from './users.service';
import { CreateUserDto } from '@task-management/data';

@Controller('users')
@UseGuards(JwtAuthGuard, RBACGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @RequiresPermission({ resource: Resource.USER, action: Action.CREATE })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @RequiresPermission({ resource: Resource.USER, action: Action.READ })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequiresPermission({ resource: Resource.USER, action: Action.READ })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
