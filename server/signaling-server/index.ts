import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const emailToSocketMapping = new Map<string, string>();
const socketToEmailMapping = new Map<string, string>();

const io = new Server(httpServer, {
  cors: {
    // Replace this with your React app's actual URL from the error message
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => { 
  console.log("Connected to socker server: " + socket.id);
  socket.on("joined-room", (data) => {
    const {email, roomId} = data;
    console.log("Joined room: " + roomId + " email: " + email);
    socket.join(roomId);
    socket.emit("user-joined", {email});
    emailToSocketMapping.set(email, socket.id);
    socketToEmailMapping.set(socket.id, email);
    socket.broadcast.to(roomId).emit("new-user-joined", {email});
  });

  socket.on("send-offer", (data) => {
    const {to, offer} = data;
    const toSocketId = emailToSocketMapping.get(to);
    if (toSocketId) {
      io.to(toSocketId).emit("offer", {offer, from: socketToEmailMapping.get(socket.id)});
    }
  })

  socket.on("offer-accepted", (data) => {
    const {to, answer} = data;
    const toSocketId = emailToSocketMapping.get(to);
    if (toSocketId) {
      io.to(toSocketId).emit("answer", {answer, from: socketToEmailMapping.get(socket.id)});
    }
  })
});

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello CodeSandbox!");
});

// app.listen(port, () => {
//   console.log(`Sandbox listening on port ${port}`);
// });
httpServer.listen(port, () => {
  console.log(`Socket server and Express running on port ${port}`);
});
