const express =require('express');
const path=require('path');
const http=require('http');
const { Server } = require("socket.io");
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomsUsers}=require('./utils/users');

const app=express();
const server =http.createServer(app);
const io = new Server(server);

const botName='admin';

app.use(express.static(path.join(__dirname,'public')));

io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);

        socket.emit('message',formatMessage(botName,'welcome to chartcord'));

        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat.`));

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomsUsers(user.room)
        })
    
    })
 
   

    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })  


    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomsUsers(user.room)
            })
        }

    })
})

const PORT=3000||process.env.PORT;

server.listen(PORT,()=>console.log(`server is running on port ${PORT}`));

