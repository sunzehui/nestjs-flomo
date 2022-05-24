import { Test, TestingModule } from '@nestjs/testing';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';

describe('StatisticController', () => {
  let controller: StatisticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticController],
      providers: [StatisticService],
    }).compile();

    controller = module.get<StatisticController>(StatisticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
