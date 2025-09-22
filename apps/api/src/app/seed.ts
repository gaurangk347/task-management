import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Role } from './entities/role.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/auditLog.entity';
import { RoleType, TaskCategory, TaskStatus } from '@task-management/data';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get(getRepositoryToken(User));
  const orgRepo = app.get(getRepositoryToken(Organization));
  const roleRepo = app.get(getRepositoryToken(Role));
  const taskRepo = app.get(getRepositoryToken(Task));
  const auditRepo = app.get(getRepositoryToken(AuditLog));

  try {
    // Create roles (idempotent)
    const existingOwner = await roleRepo.findOne({
      where: { name: RoleType.OWNER },
    });
    const existingAdmin = await roleRepo.findOne({
      where: { name: RoleType.ADMIN },
    });
    const existingViewer = await roleRepo.findOne({
      where: { name: RoleType.VIEWER },
    });

    const ownerRole =
      existingOwner ??
      (await roleRepo.save({
        name: RoleType.OWNER,
        permissions: [],
      }));

    const adminRole =
      existingAdmin ??
      (await roleRepo.save({
        name: RoleType.ADMIN,
        permissions: [],
      }));

    const viewerRole =
      existingViewer ??
      (await roleRepo.save({
        name: RoleType.VIEWER,
        permissions: [],
      }));

    // Create organization (idempotent)
    let org = await orgRepo.findOne({ where: { name: 'Acme Corp' } });
    if (!org) {
      org = await orgRepo.save({ name: 'Acme Corp' });
    }

    let subOrg = await orgRepo.findOne({
      where: { name: 'Acme Corp - Engineering' },
    });
    if (!subOrg) {
      subOrg = await orgRepo.save({
        name: 'Acme Corp - Engineering',
        parentId: org.id,
      });
    }

    // Create users (idempotent) - let @BeforeInsert handle hashing
    let ownerUser = await userRepo.findOne({
      where: { email: 'owner@example.com' },
    });
    if (!ownerUser) {
      ownerUser = await userRepo.save({
        email: 'owner@example.com',
        password: 'Owner@1234',
        organizationId: org.id,
        roleId: ownerRole.id,
      });
    } else {
      const ok = await bcrypt.compare('Owner@1234', ownerUser.password);
      if (!ok) {
        await userRepo.update(ownerUser.id, {
          password: await bcrypt.hash('Owner@1234', 10),
        });
      }
    }

    let adminUser = await userRepo.findOne({
      where: { email: 'admin@example.com' },
    });
    if (!adminUser) {
      adminUser = await userRepo.save({
        email: 'admin@example.com',
        password: 'Admin@1234',
        organizationId: org.id,
        roleId: adminRole.id,
      });
    } else {
      const ok = await bcrypt.compare('Admin@1234', adminUser.password);
      if (!ok) {
        await userRepo.update(adminUser.id, {
          password: await bcrypt.hash('Admin@1234', 10),
        });
      }
    }

    let viewerUser = await userRepo.findOne({
      where: { email: 'viewer@example.com' },
    });
    if (!viewerUser) {
      viewerUser = await userRepo.save({
        email: 'viewer@example.com',
        password: 'Viewer@1234',
        organizationId: org.id,
        roleId: viewerRole.id,
      });
    } else {
      const ok = await bcrypt.compare('Viewer@1234', viewerUser.password);
      if (!ok) {
        await userRepo.update(viewerUser.id, {
          password: await bcrypt.hash('Viewer@1234', 10),
        });
      }
    }

    // Additional viewers viewer1/2/3
    let viewerUser1 = await userRepo.findOne({
      where: { email: 'viewer1@example.com' },
    });
    if (!viewerUser1) {
      viewerUser1 = await userRepo.save({
        email: 'viewer1@example.com',
        password: 'Viewer@1234',
        organizationId: org.id,
        roleId: viewerRole.id,
      });
    } else {
      const ok = await bcrypt.compare('Viewer@1234', viewerUser1.password);
      if (!ok) {
        await userRepo.update(viewerUser1.id, {
          password: await bcrypt.hash('Viewer@1234', 10),
        });
      }
    }

    let viewerUser2 = await userRepo.findOne({
      where: { email: 'viewer2@example.com' },
    });
    if (!viewerUser2) {
      viewerUser2 = await userRepo.save({
        email: 'viewer2@example.com',
        password: 'Viewer@1234',
        organizationId: org.id,
        roleId: viewerRole.id,
      });
    } else {
      const ok = await bcrypt.compare('Viewer@1234', viewerUser2.password);
      if (!ok) {
        await userRepo.update(viewerUser2.id, {
          password: await bcrypt.hash('Viewer@1234', 10),
        });
      }
    }

    let viewerUser3 = await userRepo.findOne({
      where: { email: 'viewer3@example.com' },
    });
    if (!viewerUser3) {
      viewerUser3 = await userRepo.save({
        email: 'viewer3@example.com',
        password: 'Viewer@1234',
        organizationId: org.id,
        roleId: viewerRole.id,
      });
    } else {
      const ok = await bcrypt.compare('Viewer@1234', viewerUser3.password);
      if (!ok) {
        await userRepo.update(viewerUser3.id, {
          password: await bcrypt.hash('Viewer@1234', 10),
        });
      }
    }

    // Create example tasks if none exist
    const taskCount = await taskRepo.count();

    console.log('taskCount: ', taskCount);
    let createdTasks = [] as Task[];
    if (taskCount === 0) {
      const viewers = [viewerUser, viewerUser1, viewerUser2, viewerUser3];

      // Helper to create tasks for a viewer
      const tasksToCreate: Partial<Task>[] = [];
      viewers.forEach((v, index) => {
        // A few tasks created by the viewer themself
        tasksToCreate.push(
          {
            title: `Personal setup ${index + 1}`,
            description: 'Set up your workspace and preferences',
            status: TaskStatus.TODO,
            category: TaskCategory.PERSONAL,
            assigneeId: v.id,
            organizationId: org.id,
            createdBy: v.id,
            // set relation so creatorId is populated
            creator: { id: v.id } as User,
          },
          {
            title: `Weekly planning ${index + 1}`,
            description: 'Plan your weekly objectives and tasks',
            status: TaskStatus.IN_PROGRESS,
            category: TaskCategory.WORK,
            assigneeId: v.id,
            organizationId: org.id,
            createdBy: v.id,
            creator: { id: v.id } as User,
          },
          {
            title: `Complete onboarding ${index + 1}`,
            description: 'Finish onboarding checklist',
            status: TaskStatus.DONE,
            category: TaskCategory.WORK,
            assigneeId: v.id,
            organizationId: org.id,
            createdBy: v.id,
            creator: { id: v.id } as User,
          }
        );

        // A couple tasks created by admin and owner assigned to this viewer
        tasksToCreate.push(
          {
            title: `Admin assigned task ${index + 1}`,
            description: 'Task assigned by admin',
            status: TaskStatus.TODO,
            category: TaskCategory.WORK,
            assigneeId: v.id,
            organizationId: org.id,
            createdBy: adminUser.id,
            creator: { id: adminUser.id } as User,
          },
          {
            title: `Owner assigned task ${index + 1}`,
            description: 'Task assigned by owner',
            status: TaskStatus.TODO,
            category: TaskCategory.WORK,
            assigneeId: v.id,
            organizationId: org.id,
            createdBy: ownerUser.id,
            creator: { id: ownerUser.id } as User,
          }
        );
      });

      createdTasks = await taskRepo.save(tasksToCreate);
    }
    // Create example audit logs if none exist
    const auditCount = await auditRepo.count();
    if (auditCount === 0) {
      const tasks = createdTasks.length ? createdTasks : await taskRepo.find();
      const sampleTask = tasks[0];
      await auditRepo.save([
        {
          userId: ownerUser.id,
          action: 'login',
          resource: 'user',
          resourceId: ownerUser.id,
          details: { ip: '127.0.0.1' },
        },
        {
          userId: adminUser.id,
          action: 'create',
          resource: 'task',
          resourceId: sampleTask?.id ?? 'n/a',
          details: { title: sampleTask?.title },
        },
        {
          userId: viewerUser.id,
          action: 'view',
          resource: 'task',
          resourceId: sampleTask?.id ?? 'n/a',
          details: { from: 'dashboard' },
        },
      ]);
    }

    console.log('✅ Seed data created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('Owner: owner@example.com / Owner@1234');
    console.log('Admin: admin@example.com / Admin@1234');
    console.log('Viewer: viewer@example.com / Viewer@1234');
    console.log('\n🏢 Organizations created:');
    console.log(`- ${org.name} (ID: ${org.id})`);
    console.log(`- ${subOrg.name} (ID: ${subOrg.id})`);
    console.log('\n👤 Additional users created:');
    console.log('- viewer1@example.com / Viewer@1234');
    console.log('- viewer2@example.com / Viewer@1234');
    console.log('- viewer3@example.com / Viewer@1234');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await app.close();
  }
}

seed().catch(console.error);
