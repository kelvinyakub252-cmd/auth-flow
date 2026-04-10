const express = require("express");
const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const jwt = require("jsonwebtoken");
const sendResetPassword = require("../config/email");

const router = express.Router();

router.post("/sign-up", async (req, res) => {
  try {
    const { email, name, age, field, password } = req.body;

    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ message: "Email, name, and password are required!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
    INSERT INTO users (email, name, age, field, password)
    VALUES ($1, $2, $3, $4, $5)
    `;

    await pool.query(insertQuery, [
      email,
      name,
      +age || 0,
      field || "Backend",
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error("Sign-up error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email, and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" },
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0)
      return res
        .status(200)
        .json({ message: "If email exists, a reset link will be sent" });

    const user = result.rows[0];

    const resetToken = jwt.sign(
      { id: user.id, email },
      process.env.SECRET_KEY,
      { expiresIn: "15m" },
    );

    await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [
      resetToken,
      email,
    ]);

    await sendResetPassword(email, resetToken);

    res.json({ message: "If email exists, a reset link will be sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: "Invalid or expired token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND reset_token = $2",
      [decoded.id, token],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL WHERE id = $2",
      [hashedPassword, decoded.id],
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
