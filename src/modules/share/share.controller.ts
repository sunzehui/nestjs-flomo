import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ShareService } from './share.service';

@Controller('share')
export class ShareController {

  constructor(
    private readonly shareService: ShareService
  ) {
  }
  
  @Get('/user')
  async findUserShared(
    @Query('user_id') userId: string
  ) {
    try{
      return await this.shareService.findUserShared(userId);
    }catch(error){
      throw new BadRequestException(error.message);
    }
  }
}
