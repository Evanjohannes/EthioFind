import { RegionsService } from './regions.service';
export declare class RegionsController {
    private regionsService;
    constructor(regionsService: RegionsService);
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
