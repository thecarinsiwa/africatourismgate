import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IsNull, Repository } from 'typeorm';
import { Users } from '../../../entities/generated/users.entity';
import { ACCESS_TOKEN_TYPE } from '../auth.constants';
import { toAuthUserDto } from '../dto/auth-user.dto';
import { AccessJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret?.trim()) {
      throw new Error('Missing required environment variable: JWT_ACCESS_SECRET');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: AccessJwtPayload) {
    if (payload.type !== ACCESS_TOKEN_TYPE || !payload.sub) {
      throw new UnauthorizedException();
    }

    const user = await this.usersRepo.findOne({
      where: { id: payload.sub, deletedAt: IsNull() },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException();
    }

    return toAuthUserDto(user);
  }
}
