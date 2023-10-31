import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const expiresIn = 60 * 60 * 24;

    //IMPORTANT TO DELETE THE PASSWORD, could use an interceptor but im lazy
    delete user.password;

    const payload = {
      sub: user.id,
      username: user.email,
      roles: user.roles,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
      }),
      user,
    };
  }
}
