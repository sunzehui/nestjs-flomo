import { MigrationInterface, QueryRunner } from "typeorm"

export class AddTestUser1699096756945 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
        INSERT INTO "user_entity" ("id", "username", "nickname", "password", "memo_count", "day_count", "tag_count", "month_sign_id", "last_login", "createTime") VALUES (1, 'testuser', '浮墨用户', '$2a$10$OKY7o/i.jB4uTrTlX.tih.84j6ATjg0R2/kQwtogpaURFsFC56qWe', 0, 0, 0, 0, '', '2023-11-04 09:02:42');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            DELETE FROM "user_entity" WHERE "id" = 1
        `)
    }

}
