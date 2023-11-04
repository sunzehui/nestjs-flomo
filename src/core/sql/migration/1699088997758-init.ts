import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1699088997758 implements MigrationInterface {
    name = 'Init1699088997758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "filename" varchar NOT NULL, "filePath" varchar NOT NULL, "md5" varchar NOT NULL, CONSTRAINT "UQ_2427c0a7cbe95471e4bda120ce9" UNIQUE ("md5"))`);
        await queryRunner.query(`CREATE TABLE "article_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL DEFAULT (''), "deleteTime" datetime, "createTime" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updateTime" datetime DEFAULT (CURRENT_TIMESTAMP), "is_topic" boolean NOT NULL DEFAULT (0), "userId" integer)`);
        await queryRunner.query(`CREATE INDEX "IDX_362cadb16e72c369a1406924e2" ON "article_entity" ("id") `);
        await queryRunner.query(`CREATE TABLE "tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "is_topics" boolean NOT NULL DEFAULT (0), "deleteTime" datetime, "userId" integer)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_07771366a3cc57085e9055a15b" ON "tag" ("content") `);
        await queryRunner.query(`CREATE TABLE "user_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "nickname" varchar NOT NULL DEFAULT ('浮墨用户'), "password" varchar NOT NULL, "memo_count" integer NOT NULL, "day_count" integer NOT NULL, "tag_count" integer NOT NULL, "month_sign_id" integer NOT NULL, "last_login" varchar NOT NULL, "createTime" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_9b998bada7cff93fcb953b0c37e" UNIQUE ("username"))`);
        await queryRunner.query(`CREATE TABLE "article_tag" ("article" integer NOT NULL, "tag" integer NOT NULL, PRIMARY KEY ("article", "tag"))`);
        await queryRunner.query(`CREATE INDEX "IDX_827371107f1fcdc702a9954d2c" ON "article_tag" ("article") `);
        await queryRunner.query(`CREATE INDEX "IDX_3ed8c37e63c3fd47da99679973" ON "article_tag" ("tag") `);
        await queryRunner.query(`CREATE TABLE "article_file" ("article" integer NOT NULL, "file" integer NOT NULL, PRIMARY KEY ("article", "file"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4d1eae80069e83534b5666a0c7" ON "article_file" ("article") `);
        await queryRunner.query(`CREATE INDEX "IDX_226a330ec74a9d1529b89ea182" ON "article_file" ("file") `);
        await queryRunner.query(`CREATE TABLE "user_file" ("user" integer NOT NULL, "file" integer NOT NULL, PRIMARY KEY ("user", "file"))`);
        await queryRunner.query(`CREATE INDEX "IDX_46b6a555d096ccf8c771bc2bd0" ON "user_file" ("user") `);
        await queryRunner.query(`CREATE INDEX "IDX_48564bd91b385f2b4576a6ad18" ON "user_file" ("file") `);
        await queryRunner.query(`DROP INDEX "IDX_362cadb16e72c369a1406924e2"`);
        await queryRunner.query(`CREATE TABLE "temporary_article_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL DEFAULT (''), "deleteTime" datetime, "createTime" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updateTime" datetime DEFAULT (CURRENT_TIMESTAMP), "is_topic" boolean NOT NULL DEFAULT (0), "userId" integer, CONSTRAINT "FK_3b151817ce909c2ef790028096b" FOREIGN KEY ("userId") REFERENCES "user_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_article_entity"("id", "content", "deleteTime", "createTime", "updateTime", "is_topic", "userId") SELECT "id", "content", "deleteTime", "createTime", "updateTime", "is_topic", "userId" FROM "article_entity"`);
        await queryRunner.query(`DROP TABLE "article_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_article_entity" RENAME TO "article_entity"`);
        await queryRunner.query(`CREATE INDEX "IDX_362cadb16e72c369a1406924e2" ON "article_entity" ("id") `);
        await queryRunner.query(`DROP INDEX "IDX_07771366a3cc57085e9055a15b"`);
        await queryRunner.query(`CREATE TABLE "temporary_tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "is_topics" boolean NOT NULL DEFAULT (0), "deleteTime" datetime, "userId" integer, CONSTRAINT "FK_d0dc39ff83e384b4a097f47d3f5" FOREIGN KEY ("userId") REFERENCES "user_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_tag"("id", "content", "is_topics", "deleteTime", "userId") SELECT "id", "content", "is_topics", "deleteTime", "userId" FROM "tag"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`ALTER TABLE "temporary_tag" RENAME TO "tag"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_07771366a3cc57085e9055a15b" ON "tag" ("content") `);
        await queryRunner.query(`DROP INDEX "IDX_827371107f1fcdc702a9954d2c"`);
        await queryRunner.query(`DROP INDEX "IDX_3ed8c37e63c3fd47da99679973"`);
        await queryRunner.query(`CREATE TABLE "temporary_article_tag" ("article" integer NOT NULL, "tag" integer NOT NULL, CONSTRAINT "FK_827371107f1fcdc702a9954d2ce" FOREIGN KEY ("article") REFERENCES "article_entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_3ed8c37e63c3fd47da996799731" FOREIGN KEY ("tag") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("article", "tag"))`);
        await queryRunner.query(`INSERT INTO "temporary_article_tag"("article", "tag") SELECT "article", "tag" FROM "article_tag"`);
        await queryRunner.query(`DROP TABLE "article_tag"`);
        await queryRunner.query(`ALTER TABLE "temporary_article_tag" RENAME TO "article_tag"`);
        await queryRunner.query(`CREATE INDEX "IDX_827371107f1fcdc702a9954d2c" ON "article_tag" ("article") `);
        await queryRunner.query(`CREATE INDEX "IDX_3ed8c37e63c3fd47da99679973" ON "article_tag" ("tag") `);
        await queryRunner.query(`DROP INDEX "IDX_4d1eae80069e83534b5666a0c7"`);
        await queryRunner.query(`DROP INDEX "IDX_226a330ec74a9d1529b89ea182"`);
        await queryRunner.query(`CREATE TABLE "temporary_article_file" ("article" integer NOT NULL, "file" integer NOT NULL, CONSTRAINT "FK_4d1eae80069e83534b5666a0c73" FOREIGN KEY ("article") REFERENCES "article_entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_226a330ec74a9d1529b89ea1824" FOREIGN KEY ("file") REFERENCES "file_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("article", "file"))`);
        await queryRunner.query(`INSERT INTO "temporary_article_file"("article", "file") SELECT "article", "file" FROM "article_file"`);
        await queryRunner.query(`DROP TABLE "article_file"`);
        await queryRunner.query(`ALTER TABLE "temporary_article_file" RENAME TO "article_file"`);
        await queryRunner.query(`CREATE INDEX "IDX_4d1eae80069e83534b5666a0c7" ON "article_file" ("article") `);
        await queryRunner.query(`CREATE INDEX "IDX_226a330ec74a9d1529b89ea182" ON "article_file" ("file") `);
        await queryRunner.query(`DROP INDEX "IDX_46b6a555d096ccf8c771bc2bd0"`);
        await queryRunner.query(`DROP INDEX "IDX_48564bd91b385f2b4576a6ad18"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_file" ("user" integer NOT NULL, "file" integer NOT NULL, CONSTRAINT "FK_46b6a555d096ccf8c771bc2bd00" FOREIGN KEY ("user") REFERENCES "user_entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_48564bd91b385f2b4576a6ad188" FOREIGN KEY ("file") REFERENCES "file_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("user", "file"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_file"("user", "file") SELECT "user", "file" FROM "user_file"`);
        await queryRunner.query(`DROP TABLE "user_file"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_file" RENAME TO "user_file"`);
        await queryRunner.query(`CREATE INDEX "IDX_46b6a555d096ccf8c771bc2bd0" ON "user_file" ("user") `);
        await queryRunner.query(`CREATE INDEX "IDX_48564bd91b385f2b4576a6ad18" ON "user_file" ("file") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_48564bd91b385f2b4576a6ad18"`);
        await queryRunner.query(`DROP INDEX "IDX_46b6a555d096ccf8c771bc2bd0"`);
        await queryRunner.query(`ALTER TABLE "user_file" RENAME TO "temporary_user_file"`);
        await queryRunner.query(`CREATE TABLE "user_file" ("user" integer NOT NULL, "file" integer NOT NULL, PRIMARY KEY ("user", "file"))`);
        await queryRunner.query(`INSERT INTO "user_file"("user", "file") SELECT "user", "file" FROM "temporary_user_file"`);
        await queryRunner.query(`DROP TABLE "temporary_user_file"`);
        await queryRunner.query(`CREATE INDEX "IDX_48564bd91b385f2b4576a6ad18" ON "user_file" ("file") `);
        await queryRunner.query(`CREATE INDEX "IDX_46b6a555d096ccf8c771bc2bd0" ON "user_file" ("user") `);
        await queryRunner.query(`DROP INDEX "IDX_226a330ec74a9d1529b89ea182"`);
        await queryRunner.query(`DROP INDEX "IDX_4d1eae80069e83534b5666a0c7"`);
        await queryRunner.query(`ALTER TABLE "article_file" RENAME TO "temporary_article_file"`);
        await queryRunner.query(`CREATE TABLE "article_file" ("article" integer NOT NULL, "file" integer NOT NULL, PRIMARY KEY ("article", "file"))`);
        await queryRunner.query(`INSERT INTO "article_file"("article", "file") SELECT "article", "file" FROM "temporary_article_file"`);
        await queryRunner.query(`DROP TABLE "temporary_article_file"`);
        await queryRunner.query(`CREATE INDEX "IDX_226a330ec74a9d1529b89ea182" ON "article_file" ("file") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d1eae80069e83534b5666a0c7" ON "article_file" ("article") `);
        await queryRunner.query(`DROP INDEX "IDX_3ed8c37e63c3fd47da99679973"`);
        await queryRunner.query(`DROP INDEX "IDX_827371107f1fcdc702a9954d2c"`);
        await queryRunner.query(`ALTER TABLE "article_tag" RENAME TO "temporary_article_tag"`);
        await queryRunner.query(`CREATE TABLE "article_tag" ("article" integer NOT NULL, "tag" integer NOT NULL, PRIMARY KEY ("article", "tag"))`);
        await queryRunner.query(`INSERT INTO "article_tag"("article", "tag") SELECT "article", "tag" FROM "temporary_article_tag"`);
        await queryRunner.query(`DROP TABLE "temporary_article_tag"`);
        await queryRunner.query(`CREATE INDEX "IDX_3ed8c37e63c3fd47da99679973" ON "article_tag" ("tag") `);
        await queryRunner.query(`CREATE INDEX "IDX_827371107f1fcdc702a9954d2c" ON "article_tag" ("article") `);
        await queryRunner.query(`DROP INDEX "IDX_07771366a3cc57085e9055a15b"`);
        await queryRunner.query(`ALTER TABLE "tag" RENAME TO "temporary_tag"`);
        await queryRunner.query(`CREATE TABLE "tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "is_topics" boolean NOT NULL DEFAULT (0), "deleteTime" datetime, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "tag"("id", "content", "is_topics", "deleteTime", "userId") SELECT "id", "content", "is_topics", "deleteTime", "userId" FROM "temporary_tag"`);
        await queryRunner.query(`DROP TABLE "temporary_tag"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_07771366a3cc57085e9055a15b" ON "tag" ("content") `);
        await queryRunner.query(`DROP INDEX "IDX_362cadb16e72c369a1406924e2"`);
        await queryRunner.query(`ALTER TABLE "article_entity" RENAME TO "temporary_article_entity"`);
        await queryRunner.query(`CREATE TABLE "article_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL DEFAULT (''), "deleteTime" datetime, "createTime" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updateTime" datetime DEFAULT (CURRENT_TIMESTAMP), "is_topic" boolean NOT NULL DEFAULT (0), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "article_entity"("id", "content", "deleteTime", "createTime", "updateTime", "is_topic", "userId") SELECT "id", "content", "deleteTime", "createTime", "updateTime", "is_topic", "userId" FROM "temporary_article_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_article_entity"`);
        await queryRunner.query(`CREATE INDEX "IDX_362cadb16e72c369a1406924e2" ON "article_entity" ("id") `);
        await queryRunner.query(`DROP INDEX "IDX_48564bd91b385f2b4576a6ad18"`);
        await queryRunner.query(`DROP INDEX "IDX_46b6a555d096ccf8c771bc2bd0"`);
        await queryRunner.query(`DROP TABLE "user_file"`);
        await queryRunner.query(`DROP INDEX "IDX_226a330ec74a9d1529b89ea182"`);
        await queryRunner.query(`DROP INDEX "IDX_4d1eae80069e83534b5666a0c7"`);
        await queryRunner.query(`DROP TABLE "article_file"`);
        await queryRunner.query(`DROP INDEX "IDX_3ed8c37e63c3fd47da99679973"`);
        await queryRunner.query(`DROP INDEX "IDX_827371107f1fcdc702a9954d2c"`);
        await queryRunner.query(`DROP TABLE "article_tag"`);
        await queryRunner.query(`DROP TABLE "user_entity"`);
        await queryRunner.query(`DROP INDEX "IDX_07771366a3cc57085e9055a15b"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP INDEX "IDX_362cadb16e72c369a1406924e2"`);
        await queryRunner.query(`DROP TABLE "article_entity"`);
        await queryRunner.query(`DROP TABLE "file_entity"`);
    }

}
