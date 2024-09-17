const { pool } = require('../configs/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// User registration
const register = async (req, res) => {
  const { username, password } = req.body
  try {
    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM public.user WHERE username = $1'
    const checkUserResult = await pool.query(checkUserQuery, [username])

    if (checkUserResult.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password and save new user
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 3. Insert new user
    const insertUserQuery = `
      INSERT INTO public.user (username, password)
      VALUES ($1, $2)
      RETURNING *;
    `
    const insertUserResult = await pool.query(insertUserQuery, [username, hashedPassword])
    const newUser = insertUserResult.rows[0]

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET)

    res.status(201).json({ message: 'Success', token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// User login
const login = async (req, res) => {
  const { username, password } = req.body
  try {
    // Find user using raw SQL query
    const result = await pool.query('SELECT * FROM public.user WHERE username = $1', [username])
    const user = result.rows[0] // Access the first row of the result
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)

    res.json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  login,
  register
}
