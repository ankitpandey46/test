"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const jwt_1 = require("../Utils/jwt");
const sessionService = __importStar(require("../Services/session"));
// Map to keep track of active user sockets for single connection enforcement
const userSocketMap = new Map();
function initSocket(io) {
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Extract token from cookies in socket handshake headers
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader)
                return next(new Error('No cookies sent'));
            const tokenCookie = cookieHeader.split('; ').find((c) => c.startsWith('token='));
            if (!tokenCookie)
                return next(new Error('No token cookie found'));
            const token = tokenCookie.split('=')[1];
            if (!token)
                return next(new Error('Token is empty'));
            // Verify token
            const payload = (0, jwt_1.verifyToken)(token);
            if (!payload)
                return next(new Error('Invalid token'));
            // Verify session existence and expiration
            const session = yield sessionService.findSessionByToken(token);
            if (!session || session.expiresAt < new Date()) {
                return next(new Error('Session expired or invalid'));
            }
            // Attach userId to socket object
            socket.userId = payload.userId;
            // Enforce single socket connection per user
            const existingSocketId = userSocketMap.get(payload.userId);
            if (existingSocketId && existingSocketId !== socket.id) {
                const existingSocket = io.sockets.sockets.get(existingSocketId);
                existingSocket === null || existingSocket === void 0 ? void 0 : existingSocket.disconnect(true);
            }
            userSocketMap.set(payload.userId, socket.id);
            next();
        }
        catch (err) {
            next(err);
        }
    }));
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId} with socket id: ${socket.id}`);
        // Example: custom event listener after validation
        socket.on('exampleEvent', (data) => {
            console.log(`Received exampleEvent from user ${userId}:`, data);
            // Perform tasks here, emit responses etc.
            socket.emit('exampleResponse', { success: true, data: 'Hello from server!' });
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
            userSocketMap.delete(userId);
        });
    });
}
