"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const db_1 = require("../config/db");
const env_1 = require("../config/env");
(async () => {
    try {
        await (0, db_1.connectDatabase)();
        const existingAdmin = await User_1.User.findOne({ email: env_1.env.adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }
        await User_1.User.create({
            name: 'System Admin',
            email: env_1.env.adminEmail,
            password: env_1.env.adminPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
        });
        console.log('Seed admin created successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Seed admin failed:', error);
        process.exit(1);
    }
})();
