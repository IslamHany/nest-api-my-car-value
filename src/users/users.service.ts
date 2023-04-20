import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  create(email: string, password: string) {
    const user = this.userRepo.create({ email, password });

    return this.userRepo.save(user);
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  find(email: string) {
    return this.userRepo.find({ where: { email } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, attrs);

    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    return this.userRepo.remove(user);
  }
}
