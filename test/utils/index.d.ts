import { DataSource, Repository } from "typeorm";
import { Tenant } from "../../src/entity/Tenants";
export declare const truncateTables: (connection: DataSource) => Promise<void>;
export declare const isJwt: (token: string | null) => boolean;
export declare const createTenant: (repository: Repository<Tenant>) => Promise<{
    name: string;
    address: string;
} & Tenant>;
//# sourceMappingURL=index.d.ts.map