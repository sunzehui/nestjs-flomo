import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { parseId } from '@utils/id';

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get('/user')
  async findUserShared(@Query('user_id') userId: string) {
    try {
      return await this.shareService.findUserShared(parseId(userId));
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException((error as Error).message);
    }
  }
}
