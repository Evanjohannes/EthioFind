import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        icon: string | null;
        parentCategoryId: number | null;
    }[]>;
}
