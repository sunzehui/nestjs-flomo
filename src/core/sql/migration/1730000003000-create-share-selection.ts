import { MigrationInterface, QueryRunner } from "typeorm";

/** 精选分享表 */
export class CreateShareSelection1730000003000 implements MigrationInterface {
  name = "CreateShareSelection1730000003000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "share_selection" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "token" varchar NOT NULL,
        "userId" integer NOT NULL,
        "title" varchar NOT NULL DEFAULT (''),
        "articleIds" text NOT NULL,
        "revoked" boolean NOT NULL DEFAULT (0),
        "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_share_selection_token" ON "share_selection" ("token")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_share_selection_userId" ON "share_selection" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "share_selection"`);
  }
}
