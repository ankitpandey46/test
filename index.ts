import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import { initSocket } from './Sockets/Socket'; // import the socket initializer
import Routes from './Routes/Routes';


const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*', credentials: true },
});

app.use(cookieParser());
app.use(express.json());
app.use('/api', Routes);

// Initialize socket.io logic
initSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));