"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BusinessesService = class BusinessesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    approve(id) {
        return this.prisma.business.update({
            where: { id },
            data: { status: 'approved' },
        });
    }
    create(data, ownerId) {
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
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map