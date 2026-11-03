import { PrismaService } from '../prisma/prisma.service';
export declare class RegionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        cities: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            regionId: number;
        }[];
    } & {
        id: number;
        name: string;
        status: string;
        createdAt: Date;
    })[]>;
}
