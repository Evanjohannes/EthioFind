import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateBusinessInput {
  name: string;
  categoryId: number;
  regionId: number;
  cityId: number;
  description?: string;
  address?: string;
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  website?: string;
  hours?: string;
}

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.business.findMany({
      where: { status: 'approved' },
      include: { category: true, region: true, city: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPending() {
    return this.prisma.business.findMany({
      where: { status: 'pending' },
      include: { category: true, region: true, city: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  approve(id: number) {
    return this.prisma.business.update({
      where: { id },
      data: { status: 'approved' },
    });
  }

  create(data: CreateBusinessInput, ownerId: number) {
    return this.prisma.business.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        regionId: data.regionId,
        cityId: data.cityId,
        ownerId,
        description: data.description,
        address: data.address,
        phone: data.phone,
        telegram: data.telegram,
        whatsapp: data.whatsapp,
        website: data.website,
        hours: data.hours,
        status: 'pending',
      },
      include: { category: true, region: true, city: true },
    });
  }
}