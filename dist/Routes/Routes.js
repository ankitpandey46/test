"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../Controllers/AuthController"));
const router = (0, express_1.Router)();
router.post('/signup', AuthController_1.default.signup);
router.post('/login', AuthController_1.default.login);
// router.post('/logout', authController.logout);
exports.default = router;
