// src/socket.ts
import { io } from 'socket.io-client';

// 서버 URL에 연결
const socket = io('http://192.249.29.181:3000'); // 서버 URL

export default socket;

