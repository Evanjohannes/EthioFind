import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/businesses')
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Get('pending')
  findPending() {
    return this.businessesService.findPending();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.businessesService.create(body, req.user.userId);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.businessesService.approve(id);
  }
}