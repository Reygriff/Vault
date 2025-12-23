const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on("connection", socket => {
  console.log("CONNECTED:", socket.id);

  // When a client sends a message
  socket.on("send", data => {
    // data = { msg: "hello", senderId: socket.id }
    // send to all clients except sender
    socket.broadcast.emit("message", {
      msg: data.msg,
      senderId: data.senderId
    });
  });
});

server.listen(3000, () => {
  console.log("Vault running at http://localhost:3000");
});
