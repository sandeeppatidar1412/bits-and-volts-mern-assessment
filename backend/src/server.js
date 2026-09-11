"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.clientUrl,
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);
app.use('/api', routes_1.default);
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend is healthy',
        data: { status: 'ok' },
    });
});
app.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Naik Foods backend is running',
    });
});
const startServer = async () => {
    await (0, db_1.connectDatabase)();
    app.listen(env_1.env.port, () => {
        console.log(`Server running on port ${env_1.env.port}`);
    });
};
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
