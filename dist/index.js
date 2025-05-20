"use strict";
// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import { Response } from 'express';
// import { Server as SocketIOServer } from 'socket.io';
// import Routes from './Routes/Routes';
// import { authMiddleware,AuthRequest  } from './Services/AuthMiddleware';
// import { initSocket } from './Sockets/Socket';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express();
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// app.use(express.json());
// app.use(cookieParser());
// app.use('/api', Routes);
// const io = new SocketIOServer(server, {
//   cors: { origin: '*', credentials: true },
// });
// const server = http.createServer(app);
// initSocket(io);
// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const Socket_1 = require("./Sockets/Socket"); // import the socket initializer
const Routes_1 = __importDefault(require("./Routes/Routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: '*', credentials: true },
});
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/api', Routes_1.default);
// Initialize socket.io logic
(0, Socket_1.initSocket)(io);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
