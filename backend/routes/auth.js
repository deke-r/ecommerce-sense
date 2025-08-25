const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { getConnection } = require("../config/database")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString()
}

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" })
    }

    const con = getConnection()

    // Check if user already exists
    const [existingUsers] = await con.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const [result] = await con.execute("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)", [
      name,
      email,
      phone,
      hashedPassword,
    ])

    // Generate token
    const token = generateToken(result.insertId)

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone,
        role: "user",
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const con = getConnection()

    // Find user
    const [users] = await con.execute("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const user = users[0]

    // Check if user is active
    if (user.status === "inactive") {
      return res.status(400).json({ message: "Account is inactive" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user.id)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Forgot Password - Generate OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const con = getConnection()

    // Check if user exists
    const [users] = await con.execute("SELECT id FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found with this email" })
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete existing OTPs for this email
    await con.execute("DELETE FROM otps WHERE email = ?", [email])

    // Insert new OTP
    await con.execute("INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)", [email, otp, expiresAt])

    // In a real application, you would send this OTP via email
    console.log(`OTP for ${email}: ${otp}`)

    res.json({ message: "OTP sent to your email", otp }) // Remove otp from response in production
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    const con = getConnection()

    // Find valid OTP
    const [otps] = await con.execute("SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()", [
      email,
      otp,
    ])

    if (otps.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    res.json({ message: "OTP verified successfully" })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" })
    }

    const con = getConnection()

    // Verify OTP again
    const [otps] = await con.execute("SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()", [
      email,
      otp,
    ])

    if (otps.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await con.execute("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email])

    // Delete used OTP
    await con.execute("DELETE FROM otps WHERE email = ?", [email])

    res.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
