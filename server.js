
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = process.env.PORT || 27910; // Choose an appropriate port number

app.use(express.static(path.join(__dirname, 'public')));

app.get("/myPC", (req,res)=>{
  console.log(req.query),
  res.send("something")
});

app.get("/multiplayer", (req,res)=>{
  res.sendFile(__dirname + "/multiplayer.html")
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit("makeYoSelfDontBreakYoSelf", socket.id);
  socket.on('NewPlayerCreated', player=>{
    console.log('new player created message recieved'),
    console.log(player)
    socket.broadcast.emit("CreateNewPlayer", player)
  })

  // Handle player control events
  socket.on('keydown', (data) => {
    socket.emit('keydown', data); // Broadcast the control event to all connected clients
  });

  socket.on('keyup', (data) => {
    socket.emit('keyup', data); // Broadcast the control event to all connected clients
  });

  // Handle player position updates
  socket.on('updatePosition', (data) => {
    socket.emit('updatePosition', data); // Broadcast the position update to all connected clients
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Handle player cleanup if needed
  });
});

// Start the server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
