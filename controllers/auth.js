const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// User registration
const register = async (req, res) => {
  const { username, password } = req.body
  try {
    // Check if user already exists
    let user = await User.findOne({ where: { username } })
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password and save new user
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    user = await User.create({
      username,
      password: hashedPassword
    })

    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// User login
const login = async (req, res) => {
  const { username, password } = req.body
  try {
    // Find user
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    })

    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  login,
  register
}
