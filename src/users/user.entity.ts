import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isAdmin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsertedUser() {
    console.log('Inserted User with ID: ', this.id);
  }

  @AfterUpdate()
  logUpdatedUser() {
    console.log('Updated User with ID: ', this.id);
  }

  @AfterRemove()
  logremovedUser() {
    console.log('Removed User with email: ', this.email);
  }
}
