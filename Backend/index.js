require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDB } = require("./config/db");
const authRouter = require("./router/auth");
const profileRouter = require("./router/profile");
const authenticateToken = require("./middleware");

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

initDB();

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/json", (req, res) => {
  res.json({ message: "Hello world in json!" });
});
app.use("/auth", authRouter);
app.use("/profile", authenticateToken, profileRouter);

app.listen(port, () => console.log(`server is running on port ${port}`));
