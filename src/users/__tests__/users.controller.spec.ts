import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';
import { User } from '../user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    usersService = {
      findOne(id: number) {
        return Promise.resolve({
          id,
          email: 't@t.com',
          password: '123',
        } as User);
      },
      find(email) {
        return Promise.resolve([{ id: 1, email, password: '123' } as User]);
      },
    };
    authService = {
      signin(email: string, password: string) {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns a list of users with a given email in findAllUsers', async () => {
    const users = await controller.findAllUsers('t@t.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('t@t.com');
  });

  it('returns a user in findUser', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('throws an error if a user with id is not found in findUser', async () => {
    usersService.findOne = () =>
      Promise.reject(new NotFoundException('User not found'));

    await expect(controller.findUser('1')).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('updates session object and returns user in signin', async () => {
    const session: any = {};
    const user = await controller.signin(
      { email: 't@t.com', password: '123' },
      session,
    );

    expect(session.userId).toEqual(1);
    expect(user).toBeDefined();
  });
});
