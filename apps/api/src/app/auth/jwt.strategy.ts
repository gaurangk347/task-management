import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { RoleType } from '@task-management/data';

interface JwtPayload {
  sub: string;
  email: string;
  role?: RoleType;
  organizationId: string;
  iat?: number;
  exp?: number;
}

interface ValidatedUser {
  id: string;
  email: string;
  role?: RoleType;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    return this.authService.validateUser(payload);
  }
}
