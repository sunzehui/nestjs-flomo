import { MigrationInterface, QueryRunner } from "typeorm";

/** 每日回顾记录表 */
export class CreateReviewLog1730000001000 implements MigrationInterface {
  name = "CreateReviewLog1730000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "review_log" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "userId" integer NOT NULL,
        "articleId" integer NOT NULL,
        "reviewDate" date NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_review_log_unique" ON "review_log" ("userId", "articleId", "reviewDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_review_log_userId" ON "review_log" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "review_log"`);
  }
}
