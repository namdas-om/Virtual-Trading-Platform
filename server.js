const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 8088;
const DATA_FILE = "./users.json";

app.use(cors());
app.use(express.json());

/* ---------- HELPERS ---------- */
function readData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* ---------- TEST ---------- */
app.get("/", (req, res) => {
  res.send("Backend running without MongoDB ✅");
});

/* ---------- SIGNUP / LOGIN ---------- */
app.post("/api/auth", (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).send("Missing fields");
  }

  const users = readData();

  // LOGIN
  if (users[username]) {
    if (users[username].password !== password) {
      return res.status(401).send("Wrong password");
    }
    return res.json(users[username]);
  }

  // SIGNUP
  const newUser = {
    username,
    email: email || "",
    password,
    wallet: 100000,
    portfolio: {},
    history: []
  };

  users[username] = newUser;
  writeData(users);
  res.json(newUser);
});

/* ---------- AUTO LOGIN ---------- */
app.get("/api/user/:username", (req, res) => {
  const users = readData();
  const user = users[req.params.username];
  if (!user) return res.status(404).send("User not found");
  res.json(user);
});

/* ---------- SYNC (BUY / SELL / HISTORY) ---------- */
app.post("/api/sync", (req, res) => {
  const { username, userData } = req.body;
  const users = readData();

  users[username] = userData;
  writeData(users);

  res.json({ success: true });
});

/* ---------- LEADERBOARD ---------- */
app.get("/api/leaderboard", (req, res) => {
  const users = readData();
  res.json(Object.values(users));
});

/* ---------- START ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
