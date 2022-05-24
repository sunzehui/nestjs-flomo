import { PartialType } from '@nestjs/mapped-types';
import { CreateStatisticDto } from './create-statistic.dto';

export class UpdateStatisticDto extends PartialType(CreateStatisticDto) {}
