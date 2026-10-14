import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticModule } from '@modules/statistic/statistic.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), StatisticModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
