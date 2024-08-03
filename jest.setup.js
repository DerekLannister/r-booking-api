"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./src/config/database");
exports.default = async () => {
    await (0, database_1.ensureDatabaseInitialized)();
};
//# sourceMappingURL=jest.setup.js.map