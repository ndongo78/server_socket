const express = require("express")
const  socket =require ("socket.io")
const cors = require("cors")
const { ExpressPeerServer } = require("peer");
const http = require("http");
const app=express()

const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs",peerServer);
const PORT=process.env.PORT || 5000
let onlineUser=[]

const addUser=(username)=>{
   if(username){
  !onlineUser.some((user)=>user._id === username._id)
  && onlineUser.push(username)
}
}

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);

}; 

const getUser = (userId) => {
  return onlineUser.find((user) => user.username._id === userId);
};
 

app.use(cors())
app.use("/", (req,res)=>{
  res.send("welcome to node server")
})



const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
}); 

io.on("connect",socket=>{
  // console.log(`User connected: ${socket.id}`);
  
  socket.emit('connection',socket.id)

  socket.on("register-new-user",data=>{
    //console.log("object",data);
    addUser(data)
    
    socket.emit("user-connected",onlineUser)
    io.to(socket.id).emit("current-online-users", onlineUser);
    socket.broadcast.emit("user-connected", data);
  })
  // socket.on("user-connected",data=>{
  //   socket.emit("users-online",data)
  // })

  socket.on('sendMessage',(data)=>{
    const userTo=onlineUser.find(user=>user._id === data.receiverId)
    //console.log("userTo: ",userTo)
    // console.log("sendMessage",data) 
    if(userTo){
     socket.to(userTo.socketId).emit('messages',data)  
    }
    
  })

  
  socket.on("disconnect", (data) => {
    //console.log("a user disconnected!");
  
     //console.log(socket.id);
    removeUser(socket.id);
    io.emit("updated-users", onlineUser);
   // socket.emit("updated-users", onlineUser);
    // io.to(socket.id).emit("current-online-users", onlineUser);
    // socket.broadcast.emit("user-connected", data);
  });
  socket.on('error', ()=>{
    console.log("socket error");
  })
 
  socket.on("callUser", (data) => { 
    //console.log(data.userToCall);
    if(data.userToCall){
      const userTo=onlineUser.find(user=>user._id === data.userToCall._id)
      //console.log("userTo",userTo)
      if(userTo){
        io.to(userTo.socketId).emit("callUser", { signal:data.offerSdp, from:data.from });
      }
    }
});

socket.on("answerCall", (data) => { 
  const userTo=onlineUser.find(user=>user._id === data.userToCall._id)
  //  console.log("signal",data);
    io.to(userTo.socketId).emit("callAccepted", data)
});
})

server.listen(PORT,()=>{
  console.log (`server is running on http://localhost:${PORT}`)
})
