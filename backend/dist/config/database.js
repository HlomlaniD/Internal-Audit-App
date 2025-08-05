"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const path_1 = __importDefault(require("path"));
const db = (0, knex_1.default)({
    client: 'sqlite3',
    connection: {
        filename: path_1.default.join(__dirname, '../database/audit_system.db')
    },
    useNullAsDefault: true,
    migrations: {
        directory: path_1.default.join(__dirname, '../database/migrations')
    },
    seeds: {
        directory: path_1.default.join(__dirname, '../database/seeds')
    }
});
exports.default = db;
