import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameTables1761405976970 implements MigrationInterface {
  name = 'RenameTables1761405976970'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop FK from the old table name
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT IF EXISTS "FK_8e913e288156c133999341156ad"`,
    )

    // 2. Rename tables
    await queryRunner.renameTable(`refresh_token`, `refreshTokens`)
    await queryRunner.renameTable(`user`, `users`)

    // 3. Re-add FK with new table name and constraint
    await queryRunner.query(`
            ALTER TABLE "refreshTokens"
            ADD CONSTRAINT "FK_265bec4e500714d5269580a0219"
            FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop FK from the new table name
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" DROP CONSTRAINT IF EXISTS "FK_265bec4e500714d5269580a0219"`,
    )

    // 2. Rename back
    await queryRunner.renameTable(`refreshTokens`, `refresh_token`)
    await queryRunner.renameTable(`users`, `user`)

    // 3. Re-add original FK
    await queryRunner.query(`
            ALTER TABLE "refresh_token"
            ADD CONSTRAINT "FK_8e913e288156c133999341156ad"
            FOREIGN KEY ("userId") REFERENCES "user"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }
}
