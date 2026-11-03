import { BusinessesService } from './businesses.service';
export declare class BusinessesController {
    private businessesService;
    constructor(businessesService: BusinessesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        region: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
        };
        city: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            regionId: number;
        };
        category: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            icon: string | null;
            parentCategoryId: number | null;
        };
    } & {
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        regionId: number;
        categoryId: number;
        cityId: number;
        ownerId: number | null;
        description: string | null;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        phone: string | null;
        telegram: string | null;
        whatsapp: string | null;
        website: string | null;
        hours: string | null;
        isVerified: boolean;
    })[]>;
    findPending(): import("@prisma/client").Prisma.PrismaPromise<({
        region: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
        };
        city: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            regionId: number;
        };
        category: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            icon: string | null;
            parentCategoryId: number | null;
        };
    } & {
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        regionId: number;
        categoryId: number;
        cityId: number;
        ownerId: number | null;
        description: string | null;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        phone: string | null;
        telegram: string | null;
        whatsapp: string | null;
        website: string | null;
        hours: string | null;
        isVerified: boolean;
    })[]>;
    create(body: any, req: any): import("@prisma/client").Prisma.Prisma__BusinessClient<{
        region: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
        };
        city: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            regionId: number;
        };
        category: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            icon: string | null;
            parentCategoryId: number | null;
        };
    } & {
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        regionId: number;
        categoryId: number;
        cityId: number;
        ownerId: number | null;
        description: string | null;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        phone: string | null;
        telegram: string | null;
        whatsapp: string | null;
        website: string | null;
        hours: string | null;
        isVerified: boolean;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    approve(id: number): import("@prisma/client").Prisma.Prisma__BusinessClient<{
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        regionId: number;
        categoryId: number;
        cityId: number;
        ownerId: number | null;
        description: string | null;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        phone: string | null;
        telegram: string | null;
        whatsapp: string | null;
        website: string | null;
        hours: string | null;
        isVerified: boolean;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
