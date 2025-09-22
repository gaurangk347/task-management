import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { RoleType } from '@task-management/data';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get(getRepositoryToken(User));
  const orgRepo = app.get(getRepositoryToken(Organization));
  const roleRepo = app.get(getRepositoryToken(Role));

  try {
    // Create roles
    const ownerRole = await roleRepo.save({
      name: RoleType.OWNER,
      permissions: [],
    });

    const adminRole = await roleRepo.save({
      name: RoleType.ADMIN,
      permissions: [],
    });

    const viewerRole = await roleRepo.save({
      name: RoleType.VIEWER,
      permissions: [],
    });

    // Create organization
    const org = await orgRepo.save({
      name: 'Acme Corp',
    });

    const subOrg = await orgRepo.save({
      name: 'Acme Corp - Engineering',
      parentId: org.id,
    });

    // Create users
    await userRepo.save({
      email: 'owner@example.com',
      password: await bcrypt.hash('Owner@1234', 10),
      organizationId: org.id,
      roleId: ownerRole.id,
    });

    await userRepo.save({
      email: 'admin@example.com',
      password: await bcrypt.hash('Admin@1234', 10),
      organizationId: org.id,
      roleId: adminRole.id,
    });

    await userRepo.save({
      email: 'viewer@example.com',
      password: await bcrypt.hash('Viewer@1234', 10),
      organizationId: org.id,
      roleId: viewerRole.id,
    });

    console.log('✅ Seed data created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('Owner: owner@example.com / Owner@1234');
    console.log('Admin: admin@example.com / Admin@1234');
    console.log('Viewer: viewer@example.com / Viewer@1234');
    console.log('\n🏢 Organizations created:');
    console.log(`- ${org.name} (ID: ${org.id})`);
    console.log(`- ${subOrg.name} (ID: ${subOrg.id})`);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await app.close();
  }
}

seed().catch(console.error);
