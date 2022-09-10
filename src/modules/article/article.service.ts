// import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
import {In, Repository} from 'typeorm';
import {Injectable, UnprocessableEntityException} from '@nestjs/common';
import {CreateArticleDto} from './dto/create-article.dto';
import {UpdateArticleDto} from './dto/update-article.dto';
import {Article} from './entities/article.entity';
import {InjectRepository} from '@nestjs/typeorm';
import * as _ from 'lodash';
import {Tag} from 'src/modules/tag/entities/tag.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly repository: Repository<Article>,
        @InjectRepository(Tag)
        private readonly tagRepo: Repository<Tag>,
    ) {
    }

    async create(userId: string, createArticleDto: CreateArticleDto) {
        const articleDO = {
            content: createArticleDto.content,
            createTime: new Date().toString(),
            updateTime: new Date().toString(),
            user: {id: userId},
            tags: [],
        };
        const article = this.repository.create(articleDO);

        if (!_.isEmpty(createArticleDto.tags)) {
            // 文章所属tag，存在则保留，不存在即添加
            const existTags = await this.findExistTags(createArticleDto.tags);
            // 将所有tag重新添加回来
            existTags.forEach((tag) => {
                tag.deleteTime = null;
            });
            const recivedTags = createArticleDto.tags.map((content) => ({
                content,
                user: {id: userId},
            }));
            const beInsertTags = _.xorBy(recivedTags, existTags, 'content');
            // 将需要添加到数据库的tag添加到article的tags中

            const beInsertTagEntities = beInsertTags.map((tag) =>
                this.tagRepo.create(tag),
            );
            article.tags = _.uniqBy(
                _.concat(beInsertTagEntities, existTags),
                'content',
            );
        }

        return await this.repository.save(article);
    }

    findAll(user: string, _query: { inTrash: boolean; tag: string }) {
        const inTrash = _query.inTrash;
        const query = {user: {id: user}, tags: undefined};
        query.tags = _query.tag ? {content: _query.tag} : void 0;
        return this.repository.find({
            where: {...query},
            order: {updateTime: 'DESC'},
            relations: ['user', 'tags'],
            withDeleted: inTrash,
        });
    }

    findOne(id: string) {
        return this.repository.findOne({where: {id}, relations: ['tags']});
    }

    // 物理存在，包括软删除
    findExistTags(tags: String[]) {
        return this.tagRepo.find({
            where: {content: In(tags)},
            withDeleted: true,
        });
    }

    async update(id: string, updateArticleDto: UpdateArticleDto) {
        const articleEntity = await this.repository.findOneBy({id})
        const tags = updateArticleDto.tags;
        const content = updateArticleDto.content;
        const is_topic = updateArticleDto.is_topic;
        if (!_.isNil(tags)) {
            articleEntity['tags'] = await this.tagInsert(updateArticleDto.tags);
        }
        if (!_.isNil(content)) {
            articleEntity['content'] = content;
        }
        if (!_.isNil(is_topic)) {
            articleEntity['is_topic'] = is_topic
        }
        return await this.repository.save(articleEntity);
    }

    async findOrCreate(tag: string) {
        let tagEntity = await this.tagRepo.findOne({
            where: {content: tag},
        });
        // 不存在创建，存在返回
        if (!tagEntity) {
            tagEntity = await this.tagRepo.save({content: tag});
        }

        return tagEntity;
    }

    async tagInsert(tags: string[]) {
        const tagEntities = [];
        for (const tag of tags) {
            // 查找标签是否存在，最终必返回标签实体
            const tagEntity = await this.findOrCreate(tag);
            await this.repository.save(tagEntity);
            tagEntities.push(tagEntity);
        }
        return tagEntities;
    }

    /**
     *
     * @param id 文章id
     * @returns 删除成功实体
     * @description 删除文章，保留标签
     */
    async remove(id: string) {
        const article = await this.repository.findOne({
            where: {id},
        });
        if (_.isEmpty(article)) {
            throw new UnprocessableEntityException('文章不存在！');
        }
        return this.repository.softRemove(article);
    }
}
