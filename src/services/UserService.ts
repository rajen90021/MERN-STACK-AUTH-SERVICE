import { Brackets, Repository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../entity/User'
import { LimitedUserData, UserData, UserQueryParams } from '../types'
import createHttpError from 'http-errors'
import { Logger } from 'winston'

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private logger: Logger,
  ) {}

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

      console.log('tenant id form controller ', tenantId)
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashPassword,
        role,
        tenant: tenantId ? { id: tenantId } : null, // ✅ correct way
      })
    } catch (_err) {
      this.logger.error('Error storing user details in DB', { error: _err })
      const error = createHttpError(500, 'failed to store details in DB')
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
      relations: {
        tenant: true,
      },
    })

    return user
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        tenant: true,
      },
    })

    return user
  }

  async getAll(validatedQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder('user')

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere('user.email ILike :q', { q: searchTerm })
        }),
      )
    }

    if (validatedQuery.role) {
      queryBuilder.andWhere('user.role = :role', {
        role: validatedQuery.role,
      })
    }

    const result = await queryBuilder
      .leftJoinAndSelect('user.tenant', 'tenant')
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy('user.id', 'DESC')
      .getManyAndCount()
    return result
  }
  async update(
    userId: number,
    { firstName, lastName, role, email, tenantId }: LimitedUserData,
  ) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
        email,
        tenant: tenantId ? { id: tenantId } : null,
      })
    } catch (err) {
      console.log(err)
      const error = createHttpError(
        500,
        'Failed to update the user in the database',
      )
      throw error
    }
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
