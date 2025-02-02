"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }
    try {
        // Verify the token using JWT secret from env
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = { username: decoded.id };
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return;
    }
};
exports.authMiddleware = authMiddleware;
