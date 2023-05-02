import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

const scrypt = promisify(_scrypt);

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    usersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    //create AuthService with all of its dependencies
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('can create an instance of AuthService', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with hashed the password', async () => {
    const password = 'asdf';
    const user = await service.signup('test@test.com', password);
    const salt = user.password.split('.')[0];

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const res = `${salt}.${hash.toString('hex')}`;

    expect(user.password).toEqual(res);
  });

  it('throws an error if user signs up with email in use', async () => {
    await service.signup('t@t.com', 'password');
    await expect(service.signup('t@t.com', 'password')).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('throws if signin is called with unused email', async () => {
    await expect(service.signin('test@test.com', 'asdf')).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signup('t@t.com', 'password');

    await expect(service.signin('t@t.com', 'asdf')).rejects.toThrowError(
      UnauthorizedException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    const password = '123';

    await service.signup('t@t.com', password);
    await service.signin('t@t.com', password);
  });
});
