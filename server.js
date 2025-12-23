const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'vault_secret',
  resave: false,
  saveUninitialized: true
}));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Emo123@Reygriff",
  database: "vaultdb"
});

db.connect(err => {
  if(err){
    console.error("❌ MySQL connection failed:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected");
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signin.html"));
});

app.post("/signin", (req, res) => {
  const { username } = req.body;
  if(!username) return res.status(400).send("Missing fields");

  req.session.username = username;

  // Save username if not exists
  const sql = "INSERT IGNORE INTO users (username) VALUES (?)";
  db.query(sql, [username], err => {
    if(err){
      console.error("DB error:", err);
      return res.status(500).send("Database error");
    }
    res.redirect("/index.html");
  });
});

app.get("/index.html", (req, res) => {
  if(!req.session.username) return res.redirect("/");
  res.sendFile(path.join(__dirname, "index.html"));
});

// Get username for index.html
app.get("/get-username", (req, res) => {
  if(req.session.username){
    res.json({ username: req.session.username });
  } else {
    res.status(401).json({ username: null });
  }
});

// In-memory messages
let messages = [];

io.on("connection", socket => {
  console.log("New client connected");

  // Send previous messages
  socket.emit("previousMessages", messages);

  // Listen for messages
  socket.on("send", data => {
    messages.push({ ...data });
    socket.broadcast.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("🚀 Vault running at http://localhost:3000");
});
