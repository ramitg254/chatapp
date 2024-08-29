import {Server} from "socket.io"
import {createServer} from "http"
import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import { addUser, removeUser, getUser, getUsersInRoom} from "./users.js"

dotenv.config()

const app=express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port =process.env.PORT || 8000

app.use(cors())

app.get('/',(req,res)=>{
    res.send('Api is working')
})

io.on("connection", (socket) => {
    socket.on('join', ({ name, room,socketId }, callback) => {
      const { error, user } = addUser({ id: socketId, name, room });
      if(error) return callback(error);
      socket.join(user.room);
      
      socket.emit('message', { user: 'Admin', text: `${user.name}, welcome to room ${user.room}.`});
      socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
  
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
  
      callback();
    });
  
    
    socket.on('sendMessage', (message,socketId, callback) => {
      const user = getUser(socketId);
      io.to(user.room).emit('message', { user: user.name, text: message });
  
      callback();
    });
  
    socket.on('disconnect', () => {
      const user = removeUser(socket.id);
  
      if(user) {
        io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
      }
    })
  });

httpServer.listen(port,()=>{
    console.log("server is listening on "+`${port}`)
});