const express = require("express")
const  socket =require ("socket.io")
const cors = require("cors")

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
 
const app=express()
app.use(cors())


app.get("/", (req,res)=>{
  res.send("welcome to node server")
})


const server=app.listen(PORT,()=>{
  console.log (`server is running on http://localhost:${PORT}`)
})

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
}); 

io.on("connection",socket=>{
  socket.emit('connection',socket.id)

  socket.on("register-new-user",data=>{
    console.log("object",data);
    addUser(data)
    
    socket.emit("user-connected",onlineUser)
  })

  socket.on('sendMessage',(data)=>{
    const userTo=onlineUser.find(user=>user._id === data.receiverId)
    // console.log("userTo: ",userTo)
    // console.log("sendMessage",data) 
    socket.to(userTo.socketId).emit('messages',data) 
  })

  
  socket.on("disconnect", (data) => {
    console.log("a user disconnected!");
     //console.log(socket.id);
    removeUser(socket.id);
    socket.emit("getUsers", onlineUser);
  });
  socket.on('error', ()=>{
    console.log("socket error");
  })
 
  socket.on("callUser", (data) => { 
    const userTo=onlineUser.find(user=>user._id === data.userToCall._id)
    //console.log("firstchar",userTo)
    io.to(userTo.socketId).emit("callUser", { signal:data.signal, from:data.from });
});

socket.on("answerCall", (data) => { 
    console.log("signal",data);
    io.to(data.to).emit("callAccepted", data.signal)
});
})