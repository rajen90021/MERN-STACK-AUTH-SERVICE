import { Repository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { roles } from '../constants'

export class UserService {
  constructor(private userRepository: Repository<User>) { }

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    })
    if (user) {
      const err = createHttpError(400, 'Email already exist')
      throw err
    }
    try {
      const saltRounds = 10
      const hashPassword = await bcrypt.hash(password, saltRounds)
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashPassword,
        role,
        tenantId: tenantId || undefined,
      })
    } catch (err) {
      const error = createHttpError(500, 'failed to store dartails in DB')
      throw error
    }
  }

  async findbyEmailWithPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'role',
        'password',
      ],
    })

    return user
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    })

    return user
  }

  async list() {
    const users = await this.userRepository.find()
    return users
  }

  async update(user: User | null, userData: UserData) {
    if (!user) {
      const err = createHttpError(404, 'User not found')
      throw err
    }
    const { firstName, lastName, email } = userData
    await this.userRepository.update(
      {
        id: user.id,
      },
      {
        firstName,
        lastName,
        email,
      }
    )
  }

  async delete(user: User | null) {
    if (!user) {
      const err = createHttpError(404, 'User not found')
      throw err
    }
    await this.userRepository.delete({
      id: user.id,
    })
  }
}
