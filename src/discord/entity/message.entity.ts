import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Action } from 'src/@constants';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pull_req_url: string;

  @Column()
  message_id: string;

  @Column()
  status: Action;
}
