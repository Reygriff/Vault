const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on("connection", socket => {
  console.log("CONNECTED", socket.id);

  socket.on("send", msg => {
    console.log("MSG RECEIVED:", msg);
    io.emit("message", msg);
  });
});

server.listen(3000, () => {
  console.log("RUNNING http://localhost:3000");
});
