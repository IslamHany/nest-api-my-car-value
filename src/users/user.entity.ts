import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

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
    console.log('Removed User with ID: ', this.id);
  }
}
