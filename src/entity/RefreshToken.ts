import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'

@Entity({ name: 'refreshTokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User)
  user: User

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @UpdateDateColumn()
  createdAt: number

  @UpdateDateColumn()
  updatedAt: number
}
