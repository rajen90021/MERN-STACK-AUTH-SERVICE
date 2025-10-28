"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenant = exports.isJwt = exports.truncateTables = void 0;
const truncateTables = async (connection) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};
exports.truncateTables = truncateTables;
const isJwt = (token) => {
    if (token === null) {
        return false;
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
        return false;
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
    }
    catch (err) {
        return false;
    }
};
exports.isJwt = isJwt;
const createTenant = async (repository) => {
    const tenant = await repository.save({
        name: "Test tenant",
        address: "Test address",
    });
    return tenant;
};
exports.createTenant = createTenant;
//# sourceMappingURL=index.js.map