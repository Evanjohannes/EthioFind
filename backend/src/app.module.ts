import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RegionsModule } from './regions/regions.module';
import { CategoriesModule } from './categories/categories.module';
import { BusinessesModule } from './businesses/businesses.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, RegionsModule, CategoriesModule, BusinessesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}