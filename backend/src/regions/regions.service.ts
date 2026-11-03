import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.region.findMany({
      include: { cities: true },
      orderBy: { name: 'asc' },
    });
  }
}