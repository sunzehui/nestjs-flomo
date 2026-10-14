import { MigrationInterface, QueryRunner } from "typeorm";

/** 标签增加 parentId，用于标签树 / 分组 */
export class AddTagParent1730000002000 implements MigrationInterface {
  name = "AddTagParent1730000002000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns: Array<{ name: string }> = await queryRunner.query(
      `PRAGMA table_info("tag")`,
    );
    const hasParentId = columns.some((column) => column.name === "parentId");
    if (!hasParentId) {
      await queryRunner.query(`ALTER TABLE "tag" ADD COLUMN "parentId" integer`);
    }
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tag_parentId" ON "tag" ("parentId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tag_parentId"`);
    // SQLite 3.35+ 支持 DROP COLUMN
    await queryRunner.query(`ALTER TABLE "tag" DROP COLUMN "parentId"`);
  }
}
