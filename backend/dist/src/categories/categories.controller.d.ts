import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        icon: string | null;
        parentCategoryId: number | null;
    }[]>;
}
