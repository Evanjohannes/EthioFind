import { Controller, Get } from '@nestjs/common';
import { RegionsService } from './regions.service';

@Controller('api/regions')
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @Get()
  findAll() {
    return this.regionsService.findAll();
  }
}