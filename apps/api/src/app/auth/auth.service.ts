import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { LoginDto, AuthResponse } from '@task-management/data';
import { RoleType } from '@task-management/data';

// Typed JWT payload carried in the signed token
interface JwtPayload {
  sub: string;
  email: string;
  role?: RoleType;
  organizationId: string;
  iat?: number;
  exp?: number;
}

// Shape returned by validateUser for guards/strategies
interface ValidatedUser {
  id: string;
  email: string;
  role?: RoleType;
  organizationId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role', 'organization'],
    });

    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = await this.roleRepository.findOne({
      where: { id: user.roleId },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: role?.name,
      organizationId: user.organizationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        roleId: user.roleId,
        createdAt: user.createdAt,
        role: (role?.name as RoleType) || RoleType.VIEWER,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<ValidatedUser> {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };
  }
}
