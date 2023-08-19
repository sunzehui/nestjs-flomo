import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUser1692412548872 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查是否已存在管理员用户
        const adminUserExists = await queryRunner.query(`
            SELECT * FROM "user_entity" WHERE username = 'testuser';
        `);

        if (!adminUserExists || adminUserExists.length === 0) {
        // 创建默认的管理员用户
        await queryRunner.query(`
            INSERT INTO "user_entity" 
            ("username", "nickname", "password", "memo_count", "day_count", "tag_count", "month_sign_id", "last_login")
                VALUES 
            ('testuser', '浮墨用户', '$2a$10$FdibBMA0ioaHtDniyfreKe0SxdKx1G6SEeboFjqUllN0QjSNFzft.', 0, 0, 0, 0, '');
        `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
