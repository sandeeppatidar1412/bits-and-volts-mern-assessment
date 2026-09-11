"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const dns = require("node:dns");
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDatabase = async () => {
    if (!env_1.env.mongoUri) {
        throw new Error('MONGODB_URI is not configured.');
    }
    try {
        const dnsServers = env_1.env.dnsServers.split(',').map((server) => server.trim()).filter(Boolean);
        if (dnsServers.length > 0) {
            dns.setServers(dnsServers);
            console.log('Using configured DNS servers for MongoDB.');
        }
        await mongoose_1.default.connect(env_1.env.mongoUri);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
