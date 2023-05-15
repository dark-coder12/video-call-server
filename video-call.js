const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { createServer } = require("http");
const { Server } = require("socket.io");

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000/video-call",
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log(`Incoming call from ${data.from}`);
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    console.log(`Answering call from ${data.from}`);
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(5000, '0.0.0.0', () => console.log("Running now!!"));
