"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const fileWatcher_1 = require("./services/fileWatcher");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*', // For development
        methods: ['GET', 'POST']
    }
});
// Start watching for new AOI/SPI files
(0, fileWatcher_1.startFileWatcher)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
// Socket.io connection
exports.io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map