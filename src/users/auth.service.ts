import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersSvc: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersSvc.find(email);

    if (users.length) throw new BadRequestException('Email already In Use');

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const res = `${salt}.${hash.toString('hex')}`;

    return await this.usersSvc.create(email, res);
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersSvc.find(email);

    if (!user) throw new NotFoundException('User not found');

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash != hash.toString('hex'))
      throw new UnauthorizedException('Email Or Password Maybe Wrong');

    return user;
  }
}
