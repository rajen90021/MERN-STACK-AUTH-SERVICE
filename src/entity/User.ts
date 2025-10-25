import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Tenant } from './Tenants'

@Entity({name: 'users'})
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string
  @Column()
  email: string
  @Column({ unique: true })
  password: string

  @Column({ default: 'customer' })
  role: string

  @ManyToOne(() => Tenant)
  tenant: Tenant
}
