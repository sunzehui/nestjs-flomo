// 未依赖数据库
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Statistic } from "@modules/statistic/entities/statistic.entity";
import { Article } from "@modules/article/entities/article.entity";
import { Tag } from "@modules/tag/entities/tag.entity";
import { ArticleStatisticService } from "@modules/article-statistic/article-statistic.service";
import { NestApplication } from "@nestjs/core";

import * as request from "supertest";
import { ArticleModule } from "@modules/article/article.module";
import { UserModule } from "@/core/user/user.module";
import { AppController } from "@/app.controller";
import { User } from "@/core/user/entities/user.entity";
import { ConfigModule } from "@nestjs/config";
import { TagModule } from "@modules/tag/tag.module";
import { AuthModule } from "@/core/auth/auth.module";
import { StatisticModule } from "@modules/statistic/statistic.module";
import { AppService } from "@/app.service";
import  { isArray, isBoolean, isString } from "lodash";

const user = {
  username: "sunzehui",
  password: "sunzehui"
};
describe("CatsController", () => {

  let app: NestApplication;
  let token: any;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "mysql",
          host: "localhost",
          port: 3306,
          username: "flomo",
          password: "sunzehui",
          entities: [User, Article, Tag, Statistic],
          database: "flomo",
          synchronize: true,
          dateStrings: true
        }),
        TypeOrmModule.forFeature([Statistic, Article, Tag, User]),
        ConfigModule.forRoot({
          isGlobal: true
        }),
        TagModule,
        UserModule,
        AuthModule,
        ArticleModule,
        StatisticModule
      ],
      controllers: [AppController],
      providers: [AppService, ArticleStatisticService]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    const tokenResult = await request(app.getHttpServer()).post("/auth/login").send(user);
    token = tokenResult.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("findAll", () => {
    it("should ", async () => {
      const res = await request(app.getHttpServer())
        .get("/article")
        .auth(token, { type: "bearer" });
      console.log(res.body);
      const articleList = res.body;
      articleList.map(item => {
        expect(item.content).toBeDefined();
        expect(item.deleteTime === null || isString(item.deleteTime))
          .toBe(true);
        expect(isBoolean( item.is_topic)).toBe(true);
        expect(item.user).toBeInstanceOf(Object);
        expect(item.user.password).toBe(undefined)
        expect(item.user.username).toBeDefined()
        expect(isArray( item.tags)).toBe(true)
      });
    });
  });
});

