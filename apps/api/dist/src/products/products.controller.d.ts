import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly svc;
    constructor(svc: ProductsService);
    findAll(query: Record<string, string>): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
