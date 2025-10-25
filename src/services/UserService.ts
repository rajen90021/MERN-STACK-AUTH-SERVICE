import { Repository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { roles } from '../constants'


export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password  }: UserData) {

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
        role: roles.CUSTOMER,
      })
    } catch (err) {
      const error = createHttpError(500, 'failed to store dartails in DB')
      throw error
    }
  }

  async findbyEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    })
  
    return user
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id
      },
    })
  
    return user
  }
}
