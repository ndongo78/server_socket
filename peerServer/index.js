const express = require("express");
const { ExpressPeerServer } = require("peer");
const PORT=process.env.PORT || 9000
const app = express();

app.get("/", (req, res, next) => res.send("Hello world!"));

const http = require("http");

const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
app.use("/peerjs",peerServer);
app.get("/", (req, res, next) => res.send("Hello world!"));


server.listen(PORT,()=>{
    console.log("listening on port " + PORT);
});