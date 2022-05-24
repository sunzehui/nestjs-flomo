import { Test, TestingModule } from '@nestjs/testing';
import { ArticleStatisticService } from './article-statistic.service';

describe('ArticleStatisticService', () => {
  let service: ArticleStatisticService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleStatisticService],
    }).compile();

    service = module.get<ArticleStatisticService>(ArticleStatisticService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
