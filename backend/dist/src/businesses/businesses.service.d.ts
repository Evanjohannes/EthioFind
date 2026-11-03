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
export declare class BusinessesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(data: CreateBusinessInput, ownerId: number): import("@prisma/client").Prisma.Prisma__BusinessClient<{
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
}
export {};
