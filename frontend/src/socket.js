import { io } from "socket.io-client";

const ENDPOINT = "https://chatapp-backend-m9tg.onrender.com/";
export const socket = io(ENDPOINT, {
  transports: ["websocket"],
});
