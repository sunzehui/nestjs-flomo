import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * 标签名原先建的是「全局唯一索引」，导致：
 *   1. 不同用户无法创建同名标签；
 *   2. A 用户能取到 B 用户的标签实体。
 * 这里改成 (content, userId) 的复合唯一索引，让标签只在用户自己的范围内唯一。
 */
export class ReplaceTagUniqueIndex1730000000000 implements MigrationInterface {
  name = "ReplaceTagUniqueIndex1730000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_07771366a3cc57085e9055a15b"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tag_content_userId" ON "tag" ("content", "userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tag_userId" ON "tag" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tag_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tag_content_userId"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_07771366a3cc57085e9055a15b" ON "tag" ("content")`,
    );
  }
}
